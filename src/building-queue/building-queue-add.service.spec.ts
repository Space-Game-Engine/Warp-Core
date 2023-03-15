import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { when } from 'jest-when';
import { BuildingQueueAddService } from "@warp-core/building-queue/building-queue-add.service";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { BuildingService } from "@warp-core/building/building.service";
import { PayloadDataService } from "@warp-core/auth/payload-data.service";
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";

jest.mock("../database/repository/building-queue.repository");
jest.mock("../database/repository/building-zone.repository");
jest.mock("../building/building.service");
jest.mock("@nestjs/config");
jest.mock("../auth/payload-data.service");

describe("Building queue service tests", () => {
    let buildingQueueAddService: BuildingQueueAddService;
    let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
    let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
    let buildingService: jest.Mocked<BuildingService>;
    let payloadDataService: jest.Mocked<PayloadDataService>;
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
                PayloadDataService,
            ]
        }).compile();

        buildingQueueAddService = module.get<BuildingQueueAddService>(BuildingQueueAddService);
        buildingQueueRepository = module.get(BuildingQueueRepository);
        buildingZoneRepository = module.get(BuildingZoneRepository);
        buildingService = module.get(BuildingService);
        configService = module.get(ConfigService);
        payloadDataService = module.get(PayloadDataService);
    });

    describe("prepareDraftQueueElement", () => {
        it("should throw error when building zone not exists", async () => {
            const habitat = {
                id: 1
            } as HabitatModel;

            const addToQueueElement: AddToQueueInput = {
                counterPerHabitat: 200,
                buildingId: 1,
                endLevel: 5,
            };

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.counterPerHabitat,
                    habitat.id
                )
                .mockResolvedValue(null);

            await expect(buildingQueueAddService.prepareDraftQueueElement(addToQueueElement, habitat))
                .rejects
                .toThrow("Selected building zone not exists");

            expect(buildingZoneRepository.getSingleBuildingZone)
                .toHaveBeenCalledTimes(1);
        });

        it("should throw error when building id is not provided for first upgrade", async () => {
            const habitat = {
                id: 1
            } as HabitatModel;

            const addToQueueElement: AddToQueueInput = {
                counterPerHabitat: 200,
                buildingId: 1,
                endLevel: 5,
            };

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.counterPerHabitat,
                    habitat.id
                )
                .mockResolvedValue({
                    id: 1,
                    buildingId: null,
                    level: 0,
                    placement: null,
                    habitatId: habitat.id,
                    counterPerHabitat: addToQueueElement.counterPerHabitat
                } as BuildingZoneModel);

            await expect(buildingQueueAddService.prepareDraftQueueElement(addToQueueElement, habitat))
                .rejects
                .toThrow("First queue for selected building zone must have desired building Id");

            expect(buildingZoneRepository.getSingleBuildingZone)
                .toHaveBeenCalledTimes(1);
        });

        it("should throw error when trying to upgrade more than one level of single building zone and queue is empty and is forbidden to upgrade more than one level", async () => {
            const habitat = {
                id: 1
            } as HabitatModel;

            const addToQueueElement: AddToQueueInput = {
                counterPerHabitat: 200,
                buildingId: 1,
                endLevel: 5,
            };

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.counterPerHabitat,
                    habitat.id
                )
                .mockResolvedValue({
                    id: 1,
                    buildingId: null,
                    level: 0,
                    placement: null,
                    habitatId: habitat.id,
                    counterPerHabitat: addToQueueElement.counterPerHabitat
                } as BuildingZoneModel);

            when(configService.get)
                .expectCalledWith('habitat.buildingQueue.allowMultipleLevelUpdate' as never)
                .mockReturnValue(false);

            await expect(buildingQueueAddService.prepareDraftQueueElement(addToQueueElement, habitat))
                .rejects
                .toThrow("You can update building only one level at once");

            expect(buildingZoneRepository.getSingleBuildingZone)
                .toHaveBeenCalledTimes(1);
            expect(configService.get)
                .toHaveBeenCalledTimes(1);
        });

        it("should prepare draft building queue element when trying to upgrade one level", async () => {
            const habitat = {
                id: 1
            } as HabitatModel;

            const addToQueueElement: AddToQueueInput = {
                counterPerHabitat: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: habitat.id,
                counterPerHabitat: addToQueueElement.counterPerHabitat,
                buildingId: addToQueueElement.buildingId,
                buildingQueue: [],
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel
            };

            const timeToBuild = 100;

            when(buildingQueueRepository
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(habitat.id)
                .mockResolvedValue([]);

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.counterPerHabitat,
                    habitat.id
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
                .prepareDraftQueueElement(addToQueueElement, habitat);

            expect(newQueueElement.building).toEqual(buildingZone.building);
            expect(newQueueElement.buildingZone).toEqual(buildingZone);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });

        it("should prepare draft building queue element when trying to upgrade multiple levels", async () => {
            const habitat = {
                id: 1
            } as HabitatModel;

            const addToQueueElement: AddToQueueInput = {
                counterPerHabitat: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: habitat.id,
                counterPerHabitat: addToQueueElement.counterPerHabitat,
                buildingId: addToQueueElement.buildingId,
                buildingQueue: [],
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel
            };

            const timeToBuild = 100;

            when(buildingQueueRepository
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(habitat.id)
                .mockResolvedValue([]);

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.counterPerHabitat,
                    habitat.id
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
                .prepareDraftQueueElement(addToQueueElement, habitat);

            expect(newQueueElement.building).toEqual(buildingZone.building);
            expect(newQueueElement.buildingZone).toEqual(buildingZone);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });

        it("should prepare draft building queue element when there is already element in building queue", async () => {
            const habitat = {
                id: 1
            } as HabitatModel;

            const addToQueueElement: AddToQueueInput = {
                counterPerHabitat: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: habitat.id,
                counterPerHabitat: addToQueueElement.counterPerHabitat,
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
                endLevel: addToQueueElement.endLevel,
                endTime: new Date(),
                id: 0,
            };

            const timeToBuild = 100;

            when(buildingQueueRepository
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(habitat.id)
                .mockResolvedValue([existingBuildingQueueElement]);

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.counterPerHabitat,
                    habitat.id
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
                .prepareDraftQueueElement(addToQueueElement, habitat);

            expect(newQueueElement.building).toEqual(buildingZone.building);
            expect(newQueueElement.buildingZone).toEqual(buildingZone);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime).toEqual(existingBuildingQueueElement.endTime);
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });
    });
/*
    describe("addToQueue", () => {
        it("should throw exception when max queue elements has been reached", async () => {
            const addToQueueElement: AddToQueueInput = {
                habitatId: 1,
                counterPerHabitat: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const maxElementsInQueue = 5;

            when(buildingQueueRepository
                .countActiveBuildingQueueElementsForHabitat)
                .expectCalledWith(addToQueueElement.habitatId)
                .mockResolvedValue(maxElementsInQueue);

            when(configService.get)
                .expectCalledWith('habitat.buildingQueue.maxElementsInQueue' as never)
                .mockReturnValue(maxElementsInQueue);

            await expect(buildingQueueAddService.addToQueue(addToQueueElement))
                .rejects
                .toThrow("Max queue count (5) has been reached");
        });

        it("should add new queue element into queue", async () => {
            const addToQueueElement: AddToQueueInput = {
                habitatId: 1,
                counterPerHabitat: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const maxElementsInQueue = 5;

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: addToQueueElement.habitatId,
                counterPerHabitat: addToQueueElement.counterPerHabitat,
                buildingId: addToQueueElement.buildingId,
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel,
                buildingQueue: [],
            };

            const timeToBuild = 100;

            saveBuildingQueueElement.mockImplementation((arg: BuildingQueueElementModel) => arg);

            when(buildingQueueRepository
                .countActiveBuildingQueueElementsForHabitat)
                .expectCalledWith(addToQueueElement.habitatId)
                .mockResolvedValue(0);

            when(configService.get)
                .calledWith('habitat.buildingQueue.maxElementsInQueue' as never)
                .mockReturnValue(maxElementsInQueue)
                .calledWith('habitat.buildingQueue.allowMultipleLevelUpdate' as never)
                .mockReturnValue(true);

            when(buildingQueueRepository
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(addToQueueElement.habitatId)
                .mockResolvedValue([]);

            when(buildingZoneRepository
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.counterPerHabitat,
                    addToQueueElement.habitatId
                )
                .mockResolvedValue(buildingZone);

            when(buildingService
                .calculateTimeInSecondsToUpgradeBuilding)
                .expectCalledWith(
                    buildingZone.level,
                    addToQueueElement.endLevel,
                    addToQueueElement.buildingId,
                )
                .mockResolvedValue(timeToBuild);

            const newQueueElement = await buildingQueueAddService
                .addToQueue(addToQueueElement);

            expect(newQueueElement.building).toEqual(buildingZone.building);
            expect(newQueueElement.buildingZone).toEqual(buildingZone);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });
    });*/
});
