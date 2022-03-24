import { MockPrismaClient, createMockContext } from '../../PrismaMock';
import { BuildingService } from "../../../src/building/BuildingService";

let prismaMock: MockPrismaClient;
let buildingService: BuildingService;

beforeEach(() => {
    prismaMock = createMockContext();
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

        prismaMock.building.findFirst.mockResolvedValue(buildingObject).calledWith({
            where: {
                id: buildingId
            }
        });

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

        prismaMock.building.create.mockResolvedValue(buildingObject).calledWith({
            data: buildingInput
        });

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

        prismaMock.building.update.mockResolvedValue(buildingObject).calledWith({
            where: {
                id: buildingId
            },
            data: buildingInput
        });

        await expect(buildingService.editBuilding(buildingId, buildingInput)).resolves.toEqual(buildingObject);
    });
})