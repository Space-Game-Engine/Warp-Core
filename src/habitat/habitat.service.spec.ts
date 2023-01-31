import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RegisterUserEvent } from "../auth/register/register-user.event";
import { HabitatService } from "./habitat.service";
import { NewHabitatInput } from "./input/NewHabitatInput";
import { HabitatModel } from "./model/habitat.model";

describe("Habitat service tests", () => {
    let habitatService: HabitatService;
    let eventEmitter: EventEmitter2;
    let findOneHabitatSpy: jest.SpyInstance;
    let findHabitatSpy: jest.SpyInstance;
    let saveHabitatSpy: jest.SpyInstance;

    beforeEach(async () => {
        jest.clearAllMocks();

        eventEmitter = {
            emitAsync: jest.fn()
        } as any as EventEmitter2;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HabitatService,
                {
                    provide: getRepositoryToken(HabitatModel),
                    useValue: {
                        findOne() { },
                        find() { },
                        save() { },
                    }
                },
                {
                    provide: EventEmitter2,
                    useValue: eventEmitter
                },
            ]
        }).compile();

        habitatService = module.get<HabitatService>(HabitatService);
        let habitatRepository = module.get<Repository<HabitatModel>>(
            getRepositoryToken(HabitatModel)
        );

        findOneHabitatSpy = jest.spyOn(habitatRepository, 'findOne');
        findHabitatSpy = jest.spyOn(habitatRepository, 'find');
        saveHabitatSpy = jest.spyOn(habitatRepository, 'save');
    });

    describe("getHabitatById", () => {
        it('should load single habitat by its id', async () => {
            const habitatModel = {
                id: 10,
                name: 'test',
                userId: 20,
                isMain: true,
                buildingZones: [],
            } as HabitatModel;

            findOneHabitatSpy.mockResolvedValue(habitatModel);

            const returnedHabitatModel = await habitatService.getHabitatById(habitatModel.id);

            expect(returnedHabitatModel).toEqual(habitatModel);
            expect(findOneHabitatSpy).toBeCalledTimes(1);
            expect(findOneHabitatSpy).toBeCalledWith(expect.objectContaining({
                where: {
                    id: habitatModel.id
                }
            }));
        });
    });

    describe("getHabitatsByUserId", () => {
        it("should fetch all habitats for single user", async () => {
            const habitatModel = {
                id: 10,
                name: 'test',
                userId: 20,
                isMain: true,
                buildingZones: [],
            } as HabitatModel;

            findHabitatSpy.mockResolvedValue([habitatModel]);

            const returnedHabitatModels = await habitatService.getHabitatsByUserId(habitatModel.userId);

            expect(returnedHabitatModels).toEqual([habitatModel]);
            expect(findHabitatSpy).toBeCalledTimes(1);
            expect(findHabitatSpy).toBeCalledWith(expect.objectContaining({
                where: {
                    userId: habitatModel.userId
                }
            }));
        });
    });

    describe("createNewHabitat", () => {
        it("should create new habitat and emit event", async () => {
            const newHabitatInput = {
                userId: 20,
                isMain: true,
                name: 'test',
            } as NewHabitatInput;

            const habitatModel = {
                id: 10,
                name: newHabitatInput.name,
                userId: newHabitatInput.userId,
                isMain: newHabitatInput.isMain,
                buildingZones: [],
            } as HabitatModel;

            saveHabitatSpy.mockResolvedValue(habitatModel);

            const returnedHabitatModel = await habitatService.createNewHabitat(newHabitatInput);

            expect(returnedHabitatModel).toEqual(habitatModel);
            expect(saveHabitatSpy).toBeCalledTimes(1);
            expect(saveHabitatSpy).toBeCalledWith(expect.objectContaining(newHabitatInput));
            expect(eventEmitter.emitAsync).toBeCalledTimes(1);
            expect(eventEmitter.emitAsync).toBeCalledWith(
                expect.stringMatching('habitat.create_new'),
                expect.objectContaining({ habitat: habitatModel })
            );
        });
    });

    describe("createHabitatOnUserRegistration", () => {
        it("should create new habitat when there is no habitats for provided user id", async () => {
            const userId = 5;
            const habitatModel = {
                id: 10,
                name: 'New habitat',
                userId: userId,
                isMain: true,
                buildingZones: [],
            } as HabitatModel;
            const payload = new RegisterUserEvent(userId);

            findHabitatSpy.mockResolvedValue([]);
            saveHabitatSpy.mockResolvedValue(habitatModel);

            await habitatService.createHabitatOnUserRegistration(payload);

            expect(findHabitatSpy).toBeCalledTimes(1);
            expect(findHabitatSpy).toBeCalledWith(expect.objectContaining({
                where: {
                    userId: userId
                }
            }));
            expect(saveHabitatSpy).toBeCalledTimes(1);
            expect(eventEmitter.emitAsync).toBeCalledWith(
                expect.stringMatching('habitat.create_new'),
                expect.objectContaining({ habitat: habitatModel })
            );
            expect(payload.getHabitatId()).toBe(habitatModel.id);
        });

        it("should not create new habitat when there for provided user id habitats exists", async () => {
            const userId = 5;
            const habitatModel = {
                id: 10,
                name: 'New habitat',
                userId: userId,
                isMain: true,
                buildingZones: [],
            } as HabitatModel;
            const payload = new RegisterUserEvent(userId);

            findHabitatSpy.mockResolvedValue([habitatModel]);

            await habitatService.createHabitatOnUserRegistration(payload);

            expect(findHabitatSpy).toBeCalledTimes(1);
            expect(findHabitatSpy).toBeCalledWith(expect.objectContaining({
                where: {
                    userId: userId
                }
            }));
            expect(saveHabitatSpy).toBeCalledTimes(0);
            expect(eventEmitter.emitAsync).toBeCalledTimes(0);
            expect(payload.getHabitatId()).toBe(habitatModel.id);
        });
    });
});