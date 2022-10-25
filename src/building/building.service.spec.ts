import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BuildingService } from "./building.service";
import { BuildingModel } from "./model/building.model";
import { Role } from "./model/role.enum";

describe("Building service test", () => {
    let buildingService: BuildingService;
    let findOneBuildingSpy: jest.SpyInstance;
    let findBuildingSpy: jest.SpyInstance;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingService,
                {
                    provide: getRepositoryToken(BuildingModel),
                    useValue: {
                        findOne() {},
                        find() {},
                    }
                }
            ]
        }).compile();
        
        buildingService = module.get<BuildingService>(BuildingService);
        let buildingRepository = module.get<Repository<BuildingModel>>(
            getRepositoryToken(BuildingModel)
        );

        findOneBuildingSpy = jest.spyOn(buildingRepository, 'findOne');
        findBuildingSpy = jest.spyOn(buildingRepository, 'find');
    });

    describe("getBuildingById", () => {
        it("should return single building by provided id", async () => {
            const buildingModel = {
                id: 10,
                role: Role.RESOURCE_PRODUCTION,
                name: 'Test building',
                buildingDetailsAtCertainLevel: [],
            } as BuildingModel;

            findOneBuildingSpy.mockResolvedValue(buildingModel);

            const returnedBuilding = await buildingService.getBuildingById(buildingModel.id);

            expect(returnedBuilding).toEqual(buildingModel);
            expect(findOneBuildingSpy).toBeCalledTimes(1);
            expect(findOneBuildingSpy).toBeCalledWith(expect.objectContaining({
                where: {
                    id: buildingModel.id
                },
            }));
        });
    });

    describe("getAllBuildings", () => {
        it("should return multiple buildings", async () => {
            const buildingModel = {
                id: 10,
                role: Role.RESOURCE_PRODUCTION,
                name: 'Test building',
                buildingDetailsAtCertainLevel: [],
            } as BuildingModel;

            findBuildingSpy.mockResolvedValue([buildingModel]);

            const returnedBuilding = await buildingService.getAllBuildings();

            expect(returnedBuilding).toEqual([buildingModel]);
            expect(findBuildingSpy).toBeCalledTimes(1);
        });
    });

    describe("calculateTimeInSecondsToUpgradeBuilding", () => {
        it("should throw exception when building for provided id not exists", async () => {
            const buildingId = 1;
            const startLevel = 1;
            const endLevel = 2;
            const buildingModel = null;

            findOneBuildingSpy.mockResolvedValue(buildingModel);

            try {
                await buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId);
            } catch (error) {
                expect(error.message).toEqual("Building does not exists");
            }
        });

        it("should return zero when start and end level equals", async () => {
            const buildingId = 1;
            const startLevel = 1;
            const endLevel = startLevel;
            const buildingModel = {
                id: buildingId,
                role: Role.RESOURCE_PRODUCTION,
                name: 'Test building',
                buildingDetailsAtCertainLevel: [],
            } as BuildingModel;

            findOneBuildingSpy.mockResolvedValue(buildingModel);

            const calculatedTime = await buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId);

            expect(calculatedTime).toEqual(0);
        });

        it("should calculate time for level 2 upgrade starting from level 1", async () => {
            const buildingId = 1;
            const startLevel = 1;
            const endLevel = 2;
            const buildingModel = {
                id: buildingId,
                role: Role.RESOURCE_PRODUCTION,
                name: 'Test building',
                buildingDetailsAtCertainLevel: [
                    {
                        level: 1,
                        timeToUpdateBuildingInSeconds: 1,
                    },
                    {
                        level: 2,
                        timeToUpdateBuildingInSeconds: 10,
                    },
                    {
                        level: 3,
                        timeToUpdateBuildingInSeconds: 100,
                    },
                ]
            } as BuildingModel;

            findOneBuildingSpy.mockResolvedValue(buildingModel);

            const calculatedTime = await buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId);

            expect(calculatedTime).toEqual(10);
        });

        it("should calculate time for level 1 upgrade starting from level 0", async () => {
            const buildingId = 1;
            const startLevel = 0;
            const endLevel = 1;
            const buildingModel = {
                id: buildingId,
                role: Role.RESOURCE_PRODUCTION,
                name: 'Test building',
                buildingDetailsAtCertainLevel: [
                    {
                        level: 1,
                        timeToUpdateBuildingInSeconds: 1,
                    },
                    {
                        level: 2,
                        timeToUpdateBuildingInSeconds: 10,
                    },
                    {
                        level: 3,
                        timeToUpdateBuildingInSeconds: 100,
                    },
                ]
            } as BuildingModel;

            findOneBuildingSpy.mockResolvedValue(buildingModel);

            const calculatedTime = await buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId);

            expect(calculatedTime).toEqual(1);
        });

        it("should calculate time for level 3 upgrade starting from level 0", async () => {
            const buildingId = 1;
            const startLevel = 0;
            const endLevel = 3;
            const buildingModel = {
                id: buildingId,
                role: Role.RESOURCE_PRODUCTION,
                name: 'Test building',
                buildingDetailsAtCertainLevel: [
                    {
                        level: 1,
                        timeToUpdateBuildingInSeconds: 1,
                    },
                    {
                        level: 2,
                        timeToUpdateBuildingInSeconds: 10,
                    },
                    {
                        level: 3,
                        timeToUpdateBuildingInSeconds: 100,
                    },
                ]
            } as BuildingModel;

            findOneBuildingSpy.mockResolvedValue(buildingModel);

            const calculatedTime = await buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId);

            expect(calculatedTime).toEqual(111);
        });
    });
});