import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HabitatModel } from "../database/model/habitat.model";
import { BuildingZoneService } from "./building-zone.service";
import { BuildingZoneModel } from "../database/model/building-zone.model";
/*
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
*/