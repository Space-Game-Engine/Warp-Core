import { createPrismaClientMock, MockPrismaClient } from "../../PrismaMock";
import { BuildingQueueService } from "../../../src/buildingQueue/BuildingQueueService";
import { isEqual } from "../../isEqual";
import { testConfig } from "../../TestConfig";
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { BuildingZoneService } from "../../../src/buildingZone/BuildingZoneService";
import { BuildingService } from "../../../src/building/BuildingService";
import { BuildingQueueFetchService } from "../../../src/buildingQueue/BuildingQueueFetchService";
import { CoreConfig } from "../../../src/config/model/CoreConfig";

let prismaMock: MockPrismaClient;
let buildingQueueService: BuildingQueueService;
let buildingZoneService: DeepMockProxy<BuildingZoneService>;
let buildingService: DeepMockProxy<BuildingService>;
let buildingQueueFetch: DeepMockProxy<BuildingQueueFetchService>;
let config: CoreConfig;

beforeEach(() => {
    prismaMock = createPrismaClientMock();
    buildingZoneService = mockDeep<BuildingZoneService>();
    buildingService = mockDeep<BuildingService>();
    buildingQueueFetch = mockDeep<BuildingQueueFetchService>();
    config = testConfig();

    buildingQueueService = new BuildingQueueService(
        prismaMock,
        config,
        buildingQueueFetch,
        buildingZoneService,
        buildingService,
    );
});

describe("Building queue service tests", () => {
    describe("addToQueue", () => {
        test("Throw error when building queues is more than in config", async () => {
            const addToQueueElement = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            buildingQueueFetch
                .countActiveBuildingQueueElementsForHabitat
                .calledWith(
                    isEqual(addToQueueElement.habitatId)
                )
                .mockResolvedValue(config.habitat.buildingQueue.maxElementsInQueue);

            await expect(buildingQueueService.addToQueue(addToQueueElement))
                .rejects
                .toThrow(`Max queue count (${config.habitat.buildingQueue.maxElementsInQueue}) has been reached`);
        });
    });

    describe("prepareDraftQueueElement", () => {
        test("Throw error when building zone not exists", async () => {
            const addToQueueElement = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            buildingZoneService
                .getSingleBuildingZone
                .calledWith(
                    addToQueueElement.buildingZoneId,
                    addToQueueElement.habitatId
                )
                .mockResolvedValue(null);

            await expect(buildingQueueService.prepareDraftQueueElement(addToQueueElement))
                .rejects
                .toThrow("Selected building zone not exists");
        });

        test("Throw error when building zone is not connected with building and new queue input does not have id", async () => {
            const addToQueueElement = {
                habitatId: 1,
                buildingZoneId: 200,
                endLevel: 5,
            };

            buildingZoneService
                .getSingleBuildingZone
                .calledWith(
                    addToQueueElement.buildingZoneId,
                    addToQueueElement.habitatId
                )
                .mockResolvedValue({
                    id: 1,
                    buildingId: null,
                    level: 0,
                    placement: null,
                    habitatId: addToQueueElement.habitatId,
                    counterPerHabitat: addToQueueElement.buildingZoneId
                });

            await expect(buildingQueueService.prepareDraftQueueElement(addToQueueElement))
                .rejects
                .toThrow("First queue for selected building zone must have desired building Id");
        });

        test("Throw error when trying to upgrade more than one level of single building zone and queue is empty and is forbidden to upgrade more than one level", async () => {
            const addToQueueElement = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            buildingZoneService
                .getSingleBuildingZone
                .calledWith(
                    addToQueueElement.buildingZoneId,
                    addToQueueElement.habitatId
                )
                .mockResolvedValue({
                    id: 1,
                    buildingId: addToQueueElement.buildingId,
                    level: 1,
                    placement: null,
                    habitatId: addToQueueElement.habitatId,
                    counterPerHabitat: addToQueueElement.buildingZoneId
                });

            config.habitat.buildingQueue.allowMultipleLevelUpdate = false;

            await expect(buildingQueueService.prepareDraftQueueElement(addToQueueElement))
                .rejects
                .toThrow("You can update building only one level at once");
        });

        test("Add new queue element to building queue when trying to update one level", async () => {
            const addToQueueElement = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 2,
            };

            const buildingZone = {
                id: 1,
                buildingId: addToQueueElement.buildingId,
                level: 1,
                placement: null,
                habitatId: addToQueueElement.habitatId,
                counterPerHabitat: addToQueueElement.buildingZoneId,
            };

            const timeToBuild = 100;

            buildingQueueFetch
                .getCurrentBuildingQueueForHabitat
                .calledWith(
                    isEqual(addToQueueElement.habitatId)
                )
                .mockResolvedValue([]);

            buildingZoneService
                .getSingleBuildingZone
                .calledWith(
                    addToQueueElement.buildingZoneId,
                    addToQueueElement.habitatId
                )
                .mockResolvedValue(buildingZone);
            
            buildingService
                .calculateTimeInSecondsToUpgradeBuilding
                .calledWith(
                    buildingZone.level,
                    addToQueueElement.endLevel,
                    addToQueueElement.buildingId,
                )
                .mockResolvedValue(timeToBuild);

            config.habitat.buildingQueue.allowMultipleLevelUpdate = false;
            const newQueueElement = await buildingQueueService.prepareDraftQueueElement(addToQueueElement)

            expect(newQueueElement.buildingId).toEqual(buildingZone.buildingId);
            expect(newQueueElement.buildingZoneId).toEqual(buildingZone.id);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });
    });
});
