import { MockPrismaClient, createMockContext } from '../../PrismaMock';
import { HabitatService } from "../../../src/habitat/HabitatService";
import { isEqual } from "../../isEqual";

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

        prismaMock.habitat.findFirst.calledWith(isEqual({
            where: {
                id: habitatId
            }
        })).mockResolvedValue(habitatObject);

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

        prismaMock.habitat.findMany.calledWith(isEqual({
            where: {
                userId: userId
            }
        })).mockResolvedValue(habitatsArray);

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

        prismaMock.habitat.create.calledWith(isEqual({
            data: newHabitatInput
        })).mockResolvedValue(habitatObject);

        await expect(habitatService.createNewHabitat(newHabitatInput)).resolves.toEqual(habitatObject);
    });
});