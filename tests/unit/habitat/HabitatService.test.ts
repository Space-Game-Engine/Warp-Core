import { MockPrismaClient, createMockContext } from '../../PrismaMock';
import { HabitatService } from "../../../src/habitat/HabitatService";

let prismaMock: MockPrismaClient;
let habitatService: HabitatService;

beforeEach(() => {
    prismaMock = createMockContext();
    habitatService = new HabitatService(prismaMock);
});

describe("Habitat service tests", () => {
    test("Get single habitat by searching it by id", async () => {
        const habitatId = 5;
        const userId = 1;
        const habitatObject = {
            id: habitatId,
            name: "test",
            userId: userId,
            isMain: true,
        };

        prismaMock.habitat.findFirst.mockResolvedValue(habitatObject).calledWith({
            where: {
                id: habitatId
            }
        });

        await expect(habitatService.getHabitatById(habitatId)).resolves.toEqual(habitatObject);
    });

    test("Get all user habitats by searching it by user id", async () => {
        const habitatId = 5;
        const userId = 1;
        const habitatsArray = [{
            id: habitatId,
            name: "test",
            userId: userId,
            isMain: true,
        }];

        prismaMock.habitat.findMany.mockResolvedValue(habitatsArray).calledWith({
            where: {
                userId: userId
            }
        });

        await expect(habitatService.getHabitatsByUserId(userId)).resolves.toEqual(habitatsArray);
    });

    test("Create new habitat with proviced input", async () => {
        const newHabitatInput = {
            userId: 1,
            name: "test",
            isMain: true,
        };

        const habitatObject = {
            id: 5,
            name: newHabitatInput.name,
            userId: newHabitatInput.userId,
            isMain: newHabitatInput.isMain,
        };

        prismaMock.habitat.create.mockResolvedValue(habitatObject).calledWith({
            data: newHabitatInput
        });

        await expect(habitatService.createNewHabitat(newHabitatInput)).resolves.toEqual(habitatObject);
    });
});