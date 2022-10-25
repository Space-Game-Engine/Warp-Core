import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HabitatModel } from "../habitat/model/habitat.model";
import { BuildingZoneService } from "./building-zone.service";
import { BuildingZoneModel } from "./model/building-zone.model";

describe("Building Zone Service", () => {
    let buildingZoneService: BuildingZoneService;
    let findBuildingZoneSpy: jest.SpyInstance;
    let findOneBuildingZoneSpy: jest.SpyInstance;
    let saveBuildingZoneSpy: jest.SpyInstance;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingZoneService,
                {
                    provide: getRepositoryToken(BuildingZoneModel),
                    useValue: {
                        find() { },
                        findOne() { },
                        save() { },
                    }
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get() { }
                    }
                }
            ]
        })
            .compile();

        buildingZoneService = module.get<BuildingZoneService>(BuildingZoneService);

        let buildingZoneRepository = module.get<Repository<BuildingZoneModel>>(
            getRepositoryToken(BuildingZoneModel)
        );

        findBuildingZoneSpy = jest.spyOn(buildingZoneRepository, 'find');
        findOneBuildingZoneSpy = jest.spyOn(buildingZoneRepository, 'findOne');
        saveBuildingZoneSpy = jest.spyOn(buildingZoneRepository, 'save');
    });

    describe("getAllBuildingZonesByHabitatId", () => {
        it("should load all building zones for single habitat id", async () => {
            const habitatId = 5;
            const buildingZones = [
                {
                    id: 10,
                    counterPerHabitat: 1,
                    level: 1
                },
                {
                    id: 11,
                    counterPerHabitat: 2,
                    level: 0
                }
            ] as BuildingZoneModel[];

            findBuildingZoneSpy.mockResolvedValue(buildingZones);

            const returnedBuildingZones = await buildingZoneService.getAllBuildingZonesByHabitatId(habitatId);

            expect(returnedBuildingZones).toEqual(buildingZones);
            expect(findBuildingZoneSpy).toBeCalledWith(expect.objectContaining({
                where: {
                    habitat: {
                        id: habitatId
                    }
                }
            }));
        });
    });

    describe("getSingleBuildingZone", () => {
        it("should fetch single building zone for provided counter and habitat id", async () => {
            const habitatId = 5;
            const buildingZone = {
                id: 10,
                counterPerHabitat: 1,
                level: 1
            } as BuildingZoneModel;

            findOneBuildingZoneSpy.mockResolvedValue(buildingZone);

            const returnedBuildingZone = await buildingZoneService.getSingleBuildingZone(buildingZone.counterPerHabitat, habitatId);

            expect(returnedBuildingZone).toEqual(buildingZone);
            expect(findOneBuildingZoneSpy).toBeCalledWith(expect.objectContaining({
                where: {
                    counterPerHabitat: buildingZone.counterPerHabitat,
                    habitat: {
                        id: habitatId
                    }
                }
            }));
        });
    });

    describe("getSingleBuildingZoneById", () => {
        it("should fetch single building zone for provided building zone id", async () => {
            const buildingZone = {
                id: 10,
                counterPerHabitat: 1,
                level: 1
            } as BuildingZoneModel;

            findOneBuildingZoneSpy.mockResolvedValue(buildingZone);

            const returnedBuildingZone = await buildingZoneService.getSingleBuildingZoneById(buildingZone.id);

            expect(returnedBuildingZone).toEqual(buildingZone);
            expect(findOneBuildingZoneSpy).toBeCalledWith(expect.objectContaining({
                where: {
                    id: buildingZone.id
                }
            }));
        });
    });

    describe("createNewBuildingZone", () => {
        it("should create first building zone with its counter set as 1", async () => {
            const habitatId = 5;
            const alreadyCreatedBuildingZones = [] as BuildingZoneModel[];

            findBuildingZoneSpy.mockResolvedValue(alreadyCreatedBuildingZones);

            await buildingZoneService.createNewBuildingZone({ id: habitatId } as HabitatModel);

            expect(saveBuildingZoneSpy).toBeCalledWith(expect.objectContaining({
                counterPerHabitat: 1,
                habitat: { id: habitatId },
            }));
        });

        it("should create second building zone with its counter set as 2", async () => {
            const habitatId = 5;
            const alreadyCreatedBuildingZones = [{
                counterPerHabitat: 1,
            }] as BuildingZoneModel[];

            findBuildingZoneSpy.mockResolvedValue(alreadyCreatedBuildingZones);

            await buildingZoneService.createNewBuildingZone({ id: habitatId } as HabitatModel);

            expect(saveBuildingZoneSpy).toBeCalledWith(expect.objectContaining({
                counterPerHabitat: 2,
                habitat: { id: habitatId },
            }));
        });

        it("should create next building zone with its counter set as 5, but counter have gaps", async () => {
            const habitatId = 5;
            const alreadyCreatedBuildingZones = [
                {
                    counterPerHabitat: 1,
                },
                {
                    counterPerHabitat: 2,
                },
                {
                    counterPerHabitat: 4,
                },
            ] as BuildingZoneModel[];

            findBuildingZoneSpy.mockResolvedValue(alreadyCreatedBuildingZones);

            await buildingZoneService.createNewBuildingZone({ id: habitatId } as HabitatModel);

            expect(saveBuildingZoneSpy).toBeCalledWith(expect.objectContaining({
                counterPerHabitat: 5,
                habitat: { id: habitatId },
            }));
        });
    });
});