import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { when } from 'jest-when';
import { BuildingQueueAddService } from "@warp-core/building-queue/building-queue-add.service";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { BuildingService } from "@warp-core/building";
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { AuthorizedHabitatModel } from "@warp-core/auth/payload/model/habitat.model";

jest.mock("../database/repository/building-queue.repository");
jest.mock("../database/repository/building-zone.repository");
jest.mock("../auth/payload/model/habitat.model");
jest.mock("../building/building.service");
jest.mock("@nestjs/config");

describe("Building queue add service tests", () => {
    let buildingQueueAddService: BuildingQueueAddService;
    let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
    let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
    let buildingService: jest.Mocked<BuildingService>;
    let habitatMock: jest.Mocked<AuthorizedHabitatModel>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingQueueAddService,
                BuildingQueueRepository,
                BuildingZoneRepository,
                BuildingService,
                ConfigService,
                AuthorizedHabitatModel
            ]
        }).compile();

        buildingQueueAddService = module.get<BuildingQueueAddService>(BuildingQueueAddService);
        buildingQueueRepository = module.get(BuildingQueueRepository);
        buildingZoneRepository = module.get(BuildingZoneRepository);
        buildingService = module.get(BuildingService);
        configService = module.get(ConfigService);
        habitatMock = module.get(AuthorizedHabitatModel);
    });

    describe("prepareDraftQueueElement", () => {
        it("should throw error when trying to upgrade more than one level of single building zone and queue is empty and is forbidden to upgrade more than one level", async () => {
            habitatMock.id = 1;

            const addToQueueElement: AddToQueueInput = {
                localBuildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.localBuildingZoneId,
                    habitatMock.id
                )
                .mockResolvedValue({
                    id: 1,
                    buildingId: null,
                    level: 0,
                    placement: null,
                    habitatId: habitatMock.id,
                    localBuildingZoneId: addToQueueElement.localBuildingZoneId
                } as BuildingZoneModel);

            when(configService.get)
                .expectCalledWith('habitat.buildingQueue.allowMultipleLevelUpdate' as never)
                .mockReturnValue(false);

            await expect(buildingQueueAddService.prepareDraftQueueElement(addToQueueElement))
                .rejects
                .toThrow("You can only upgrade a building by one level at a time");

            expect(buildingZoneRepository.getSingleBuildingZone)
                .toHaveBeenCalledTimes(1);
            expect(configService.get)
                .toHaveBeenCalledTimes(1);
        });

        it("should prepare draft building queue element when trying to upgrade one level", async () => {
            habitatMock.id = 1;

            const addToQueueElement: AddToQueueInput = {
                localBuildingZoneId: 200,
                buildingId: 1,
                endLevel: 2,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: habitatMock.id,
                localBuildingZoneId: addToQueueElement.localBuildingZoneId,
                buildingId: addToQueueElement.buildingId,
                buildingQueue: [],
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel
            };

            const timeToBuild = 100;

            when(buildingQueueRepository
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(habitatMock.id)
                .mockResolvedValue([]);

            when(buildingQueueRepository
                .getCurrentBuildingQueueForBuildingZone)
                .expectCalledWith(buildingZone)
                .mockResolvedValue([]);

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.localBuildingZoneId,
                    habitatMock.id
                )
                .mockResolvedValue(buildingZone);

            when(configService.get)
                .expectCalledWith('habitat.buildingQueue.allowMultipleLevelUpdate' as never)
                .mockReturnValue(false);

            when(buildingService
                .calculateTimeInSecondsToUpgradeBuilding)
                .expectCalledWith(
                    buildingZone.level,
                    addToQueueElement.endLevel,
                    addToQueueElement.buildingId,
                )
                .mockResolvedValue(timeToBuild);

            const newQueueElement = await buildingQueueAddService
                .prepareDraftQueueElement(addToQueueElement);

            expect(newQueueElement.buildingId).toEqual(buildingZone.buildingId);
            expect(newQueueElement.buildingZoneId).toEqual(buildingZone.id);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });

        it("should prepare draft building queue element when trying to upgrade multiple levels", async () => {
            habitatMock.id = 1;

            const addToQueueElement: AddToQueueInput = {
                localBuildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: habitatMock.id,
                localBuildingZoneId: addToQueueElement.localBuildingZoneId,
                buildingId: addToQueueElement.buildingId,
                buildingQueue: [],
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel
            };

            const timeToBuild = 100;

            when(buildingQueueRepository
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(habitatMock.id)
                .mockResolvedValue([]);

            when(buildingQueueRepository
                .getCurrentBuildingQueueForBuildingZone)
                .expectCalledWith(buildingZone)
                .mockResolvedValue([]);

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.localBuildingZoneId,
                    habitatMock.id
                )
                .mockResolvedValue(buildingZone);

            when(configService.get)
                .expectCalledWith('habitat.buildingQueue.allowMultipleLevelUpdate' as never)
                .mockReturnValue(true);

            when(buildingService
                .calculateTimeInSecondsToUpgradeBuilding)
                .expectCalledWith(
                    buildingZone.level,
                    addToQueueElement.endLevel,
                    addToQueueElement.buildingId,
                )
                .mockResolvedValue(timeToBuild);

            const newQueueElement = await buildingQueueAddService
                .prepareDraftQueueElement(addToQueueElement);

            expect(newQueueElement.buildingId).toEqual(buildingZone.buildingId);
            expect(newQueueElement.buildingZoneId).toEqual(buildingZone.id);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });

        it("should prepare draft building queue element when there is already element in building queue", async () => {
            habitatMock.id = 1;

            const addToQueueElement: AddToQueueInput = {
                localBuildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: habitatMock.id,
                localBuildingZoneId: addToQueueElement.localBuildingZoneId,
                buildingId: addToQueueElement.buildingId,
                buildingQueue: [],
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel
            };

            const existingBuildingQueueElement: BuildingQueueElementModel = {
                building: buildingZone.building,
                buildingZone: buildingZone,
                startTime: new Date(),
                startLevel: buildingZone!.level,
                endLevel: 4,
                endTime: new Date(),
                id: 0,
                isConsumed: false
            };

            const timeToBuild = 100;

            when(buildingQueueRepository
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(habitatMock.id)
                .mockResolvedValue([]);

            when(buildingQueueRepository
                .getCurrentBuildingQueueForBuildingZone)
                .expectCalledWith(buildingZone)
                .mockResolvedValue([]);

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.localBuildingZoneId,
                    habitatMock.id
                )
                .mockResolvedValue(buildingZone);

            when(configService.get)
                .expectCalledWith('habitat.buildingQueue.allowMultipleLevelUpdate' as never)
                .mockReturnValue(true);

            when(buildingService
                .calculateTimeInSecondsToUpgradeBuilding)
                .expectCalledWith(
                    buildingZone.level,
                    addToQueueElement.endLevel,
                    addToQueueElement.buildingId,
                )
                .mockResolvedValue(timeToBuild);

            const newQueueElement = await buildingQueueAddService
                .prepareDraftQueueElement(addToQueueElement);

            expect(newQueueElement.buildingId).toEqual(buildingZone.buildingId);
            expect(newQueueElement.buildingZoneId).toEqual(buildingZone.id);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime.toUTCString()).toEqual(existingBuildingQueueElement.endTime.toUTCString());
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });

        it("should throw error during preparing draft building queue element when there is already element in building queue but it has higher level than new one", async () => {
            habitatMock.id = 1;

            const addToQueueElement: AddToQueueInput = {
                localBuildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: habitatMock.id,
                localBuildingZoneId: addToQueueElement.localBuildingZoneId,
                buildingId: addToQueueElement.buildingId,
                buildingQueue: [],
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel
            };

            const existingBuildingQueueElement: BuildingQueueElementModel = {
                building: buildingZone.building,
                buildingZone: buildingZone,
                startTime: new Date(),
                startLevel: buildingZone!.level,
                endLevel: 8,
                endTime: new Date(),
                id: 0,
                isConsumed: false
            };

            when(buildingQueueRepository
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(habitatMock.id)
                .mockResolvedValue([existingBuildingQueueElement]);

            when(buildingQueueRepository
                .getCurrentBuildingQueueForBuildingZone)
                .expectCalledWith(buildingZone)
                .mockResolvedValue([existingBuildingQueueElement]);

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.localBuildingZoneId,
                    habitatMock.id
                )
                .mockResolvedValue(buildingZone);

            when(configService.get)
                .expectCalledWith('habitat.buildingQueue.allowMultipleLevelUpdate' as never)
                .mockReturnValue(true);

            await expect(buildingQueueAddService.prepareDraftQueueElement(addToQueueElement))
                .rejects
                .toThrow("New queue element should have end level higher than last queue element");
        });
    });
});
