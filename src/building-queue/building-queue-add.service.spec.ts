import { Test, TestingModule } from "@nestjs/testing";
import { BuildingZoneService } from "../building-zone/building-zone.service";
import { BuildingService } from "../building/building.service";
import { BuildingQueueFetchService } from "./building-queue-fetch.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BuildingQueueElementModel } from "./model/building-queue-element.model";
import { AddToQueueInput } from "./input/add-to-queue.input";
import { BuildingQueueAddService } from "./building-queue-add.service";
import { ConfigService } from "@nestjs/config";
import { when } from 'jest-when';
import { BuildingZoneModel } from "../building-zone/model/building-zone.model";
import { HabitatModel } from "../habitat/model/habitat.model";
import { BuildingModel } from "../building/model/building.model";
import { Repository } from "typeorm";

jest.mock("./building-queue-fetch.service");
jest.mock("../building-zone/building-zone.service");
jest.mock("../building/building.service");
jest.mock("@nestjs/config");

describe("Building queue service tests", () => {
    let buildingQueueAddService: BuildingQueueAddService;
    let buildingQueueFetchService: jest.Mocked<BuildingQueueFetchService>;
    let buildingZoneService: jest.Mocked<BuildingZoneService>;
    let buildingService: jest.Mocked<BuildingService>;
    let configService: jest.Mocked<ConfigService>;
    let createBuildingQueueElement: jest.SpyInstance;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingQueueAddService,
                {
                    provide: getRepositoryToken(BuildingQueueElementModel),
                    useValue: {
                        create(arg) { },
                    },
                },
                BuildingQueueFetchService,
                BuildingZoneService,
                BuildingService,
                ConfigService,
            ]
        }).compile();

        buildingQueueAddService = module.get<BuildingQueueAddService>(BuildingQueueAddService);
        buildingQueueFetchService = module.get(BuildingQueueFetchService);
        buildingZoneService = module.get(BuildingZoneService);
        buildingService = module.get(BuildingService);
        configService = module.get(ConfigService);

        let buildingQueueRepository = module.get<Repository<BuildingQueueElementModel>>(
            getRepositoryToken(BuildingQueueElementModel)
        );

        createBuildingQueueElement = jest.spyOn(buildingQueueRepository, 'create');
    });

    describe("prepareDraftQueueElement", () => {
        it("should throw error when building zone not exists", async () => {
            const addToQueueElement: AddToQueueInput = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            when(buildingZoneService
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.buildingZoneId,
                    addToQueueElement.habitatId
                )
                .mockResolvedValue(null);

            await expect(buildingQueueAddService.prepareDraftQueueElement(addToQueueElement))
                .rejects
                .toThrow("Selected building zone not exists");

            expect(buildingZoneService.getSingleBuildingZone)
                .toHaveBeenCalledTimes(1);
        });

        it("should throw error when building id is not provided for first upgrade", async () => {
            const addToQueueElement: AddToQueueInput = {
                habitatId: 1,
                buildingZoneId: 200,
                endLevel: 5,
            };

            when(buildingZoneService
                .getSingleBuildingZone)
                .expectCalledWith(
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
                } as BuildingZoneModel);

            await expect(buildingQueueAddService.prepareDraftQueueElement(addToQueueElement))
                .rejects
                .toThrow("First queue for selected building zone must have desired building Id");

            expect(buildingZoneService.getSingleBuildingZone)
                .toHaveBeenCalledTimes(1);
        });

        it("should throw error when trying to upgrade more than one level of single building zone and queue is empty and is forbidden to upgrade more than one level", async () => {
            const addToQueueElement: AddToQueueInput = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            when(buildingZoneService
                .getSingleBuildingZone)
                .expectCalledWith(
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
                } as BuildingZoneModel);

            when(configService.get)
                .expectCalledWith('habitat.buildingQueue.allowMultipleLevelUpdate' as never)
                .mockReturnValue(false);

            await expect(buildingQueueAddService.prepareDraftQueueElement(addToQueueElement))
                .rejects
                .toThrow("You can update building only one level at once");

            expect(buildingZoneService.getSingleBuildingZone)
                .toHaveBeenCalledTimes(1);
            expect(configService.get)
                .toHaveBeenCalledTimes(1);
        });

        it("should prepare draft building queue element when trying to upgrade one level", async () => {
            const addToQueueElement: AddToQueueInput = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 2,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: addToQueueElement.habitatId,
                counterPerHabitat: addToQueueElement.buildingZoneId,
                buildingId: addToQueueElement.buildingId,
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel
            };

            const timeToBuild = 100;

            when(buildingQueueFetchService
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(addToQueueElement.habitatId)
                .mockResolvedValue([]);

            when(buildingZoneService
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.buildingZoneId,
                    addToQueueElement.habitatId
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

            expect(newQueueElement.building).toEqual(buildingZone.building);
            expect(newQueueElement.buildingZone).toEqual(buildingZone);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });

        it("should prepare draft building queue element when trying to upgrade multiple levels", async () => {
            const addToQueueElement: AddToQueueInput = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: addToQueueElement.habitatId,
                counterPerHabitat: addToQueueElement.buildingZoneId,
                buildingId: addToQueueElement.buildingId,
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel
            };

            const timeToBuild = 100;

            when(buildingQueueFetchService
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(addToQueueElement.habitatId)
                .mockResolvedValue([]);

            when(buildingZoneService
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.buildingZoneId,
                    addToQueueElement.habitatId
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

            expect(newQueueElement.building).toEqual(buildingZone.building);
            expect(newQueueElement.buildingZone).toEqual(buildingZone);
            expect(newQueueElement.startLevel).toEqual(buildingZone.level);
            expect(newQueueElement.endLevel).toEqual(addToQueueElement.endLevel);
            expect(newQueueElement.startTime).toBeInstanceOf(Date);
            expect(newQueueElement.endTime).toBeInstanceOf(Date);
            expect(newQueueElement.startTime.getTime()).toBeLessThan(newQueueElement.endTime.getTime());
        });

        it("should prepare draft building queue element when there is already element in building queue", async () => {
            const addToQueueElement: AddToQueueInput = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const buildingZone: BuildingZoneModel = {
                id: 1,
                level: 1,
                placement: null,
                habitat: {} as HabitatModel,
                habitatId: addToQueueElement.habitatId,
                counterPerHabitat: addToQueueElement.buildingZoneId,
                buildingId: addToQueueElement.buildingId,
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

            when(buildingQueueFetchService
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(addToQueueElement.habitatId)
                .mockResolvedValue([existingBuildingQueueElement]);

            when(buildingZoneService
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.buildingZoneId,
                    addToQueueElement.habitatId
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

    describe("addToQueue", () => {
        it("should throw exception when max queue elements has been reached", async () => {
            const addToQueueElement: AddToQueueInput = {
                habitatId: 1,
                buildingZoneId: 200,
                buildingId: 1,
                endLevel: 5,
            };

            const maxElementsInQueue = 5;

            when(buildingQueueFetchService
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
                buildingZoneId: 200,
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
                counterPerHabitat: addToQueueElement.buildingZoneId,
                buildingId: addToQueueElement.buildingId,
                building: {
                    id: addToQueueElement.buildingId,
                } as BuildingModel
            };

            const timeToBuild = 100;

            createBuildingQueueElement.mockImplementation((arg: BuildingQueueElementModel) => arg);

            when(buildingQueueFetchService
                .countActiveBuildingQueueElementsForHabitat)
                .expectCalledWith(addToQueueElement.habitatId)
                .mockResolvedValue(0);

            when(configService.get)
                .calledWith('habitat.buildingQueue.maxElementsInQueue' as never)
                .mockReturnValue(maxElementsInQueue)
                .calledWith('habitat.buildingQueue.allowMultipleLevelUpdate' as never)
                .mockReturnValue(true);

            when(buildingQueueFetchService
                .getCurrentBuildingQueueForHabitat)
                .expectCalledWith(addToQueueElement.habitatId)
                .mockResolvedValue([]);

            when(buildingZoneService
                .getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueElement.buildingZoneId,
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
    });
});
