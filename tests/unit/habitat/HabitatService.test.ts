import {createPrismaClientMock, MockPrismaClient} from '../../PrismaMock';
import {HabitatService} from "../../../src/habitat/HabitatService";
import {isEqual} from "../../isEqual";
import {createEventEmitterMock, MockEventEmitter} from "../../EventEmitterMock";

let prismaMock: MockPrismaClient;
let eventMock: MockEventEmitter;
let habitatService: HabitatService;

beforeEach(() => {
    prismaMock = createPrismaClientMock();
    eventMock = createEventEmitterMock();
    habitatService = new HabitatService(
        prismaMock,
        eventMock
    );
});

describe("Habitat service tests", () => {
    describe("Simple habitat getters", () => {
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
    });
    describe("Create new habitats", () => {
        test("Create new habitat with provided input", async () => {
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

            eventMock.emit.calledWith(isEqual('habitat.create_new'), isEqual(habitatObject));

            await expect(habitatService.createNewHabitat(newHabitatInput)).resolves.toEqual(habitatObject);
        });
    });
});
