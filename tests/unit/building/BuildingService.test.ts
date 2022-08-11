import { createPrismaClientMock, MockPrismaClient } from '../../PrismaMock';
import { BuildingService } from "../../../src/building/BuildingService";
import { isEqual } from "../../isEqual";

let prismaMock: MockPrismaClient;
let buildingService: BuildingService;

beforeEach(() => {
    prismaMock = createPrismaClientMock();
    buildingService = new BuildingService(prismaMock);
});

describe("Building service tests", () => {
    test("Get all available buildings", async () => {
        const buildingsArray = [
            {
                id: 1,
                name: 'Lorem',
                role: 5
            },
            {
                id: 2,
                name: 'Ipsum',
                role: 7
            }
        ];

        prismaMock.building.findMany.mockResolvedValue(buildingsArray);

        await expect(buildingService.getAllBuildings()).resolves.toEqual(buildingsArray);
    });

    test("Get single building details by its id", async () => {
        const buildingId = 1;
        const buildingObject = {
            id: buildingId,
            name: 'Lorem',
            role: 5
        };

        prismaMock.building.findFirst.calledWith(isEqual({
            where: {
                id: buildingId
            }
        })).mockResolvedValue(buildingObject);

        await expect(buildingService.getBuildingById(buildingId)).resolves.toEqual(buildingObject);
    });

    test("Create new building by input data", async () => {
        const buildingId = 1;

        const buildingInput = {
            name: 'Ipsum',
            role: 10
        };

        const buildingObject = {
            id: buildingId,
            name: buildingInput.name,
            role: buildingInput.role
        };

        prismaMock.building.create.calledWith(isEqual({
            data: buildingInput
        })).mockResolvedValue(buildingObject);

        await expect(buildingService.createNewBuilding(buildingInput)).resolves.toEqual(buildingObject);
    });

    test("Update single building details by its id and input data", async () => {
        const buildingId = 1;

        const buildingInput = {
            name: 'Ipsum',
            role: 10
        };

        const buildingObject = {
            id: buildingId,
            name: buildingInput.name,
            role: buildingInput.role
        };

        prismaMock.building.update.calledWith(isEqual({
            where: {
                id: buildingId
            },
            data: buildingInput
        })).mockResolvedValue(buildingObject);

        await expect(buildingService.editBuilding(buildingId, buildingInput)).resolves.toEqual(buildingObject);
    });

    describe("calculateTimeInSecondsToUpgradeBuilding", () => {
        test("Throw exception when building not exists", async () => {
            const buildingId = 1;
            const startLevel = 1;
            const endLevel = 2;
            const buildingObject = null;

            prismaMock.building.findFirst.calledWith(isEqual({
                where: {
                    id: buildingId
                }
            })).mockResolvedValue(buildingObject);

            await expect(buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId)).rejects.toThrow("Building does not exists");
        });

        test("Time to upgrade equals zero when start and end levels are equal", async () => {
            const buildingId = 1;
            const startLevel = 1;
            const endLevel = startLevel;
            const buildingObject = {
                id: buildingId,
                name: "test name",
                role: 123
            };

            prismaMock.building.findFirst.calledWith(isEqual({
                where: {
                    id: buildingId
                }
            })).mockResolvedValue(buildingObject);

            await expect(buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId)).resolves.toEqual(0);
        });

        test("Time to upgrade should sum when there is one level up", async () => {
            const buildingId = 1;
            const startLevel = 1;
            const endLevel = 2;
            const buildingObject = {
                id: buildingId,
                name: "test name",
                role: 123,
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
            };

            prismaMock.building.findFirst.calledWith(isEqual({
                where: {
                    id: buildingId
                }
            })).mockResolvedValue(buildingObject);

            await expect(buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId)).resolves.toEqual(10);
        });

        test("Time to upgrade should sum when there is one level up strating from zero", async () => {
            const buildingId = 1;
            const startLevel = 0;
            const endLevel = 1;
            const buildingObject = {
                id: buildingId,
                name: "test name",
                role: 123,
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
            };

            prismaMock.building.findFirst.calledWith(isEqual({
                where: {
                    id: buildingId
                }
            })).mockResolvedValue(buildingObject);

            await expect(buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId)).resolves.toEqual(1);
        });

        test("Time to upgrade should sum when there are multiple levels up strating from zero", async () => {
            const buildingId = 1;
            const startLevel = 0;
            const endLevel = 3;
            const buildingObject = {
                id: buildingId,
                name: "test name",
                role: 123,
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
            };

            prismaMock.building.findFirst.calledWith(isEqual({
                where: {
                    id: buildingId
                }
            })).mockResolvedValue(buildingObject);

            await expect(buildingService.calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId)).resolves.toEqual(111);
        });
    });
})
