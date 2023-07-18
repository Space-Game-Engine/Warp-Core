import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { when } from "jest-when";
import { NewHabitatInput } from "@warp-core/habitat/input/NewHabitatInput";
import { CreateNewHabitatService } from "@warp-core/habitat/create/create-new-habitat.service";
import { HabitatModel, HabitatRepository } from "@warp-core/database";
import { RegisterUserEvent } from "@warp-core/auth";

jest.mock("@warp-core/database/repository/habitat.repository");
jest.mock("@warp-core/auth/payload/model/habitat.model");

describe("Habitat service tests", () => {
    let createNewHabitatService: CreateNewHabitatService;
    let eventEmitter: EventEmitter2;
    let habitatRepository: jest.Mocked<HabitatRepository>;

    beforeEach(async () => {
        jest.clearAllMocks();

        eventEmitter = {
            emitAsync: jest.fn()
        } as any as EventEmitter2;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateNewHabitatService,
                HabitatRepository,
                {
                    provide: EventEmitter2,
                    useValue: eventEmitter
                },
            ]
        }).compile();

        createNewHabitatService = module.get<CreateNewHabitatService>(CreateNewHabitatService);
        habitatRepository = module.get(HabitatRepository);
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

            when(habitatRepository.save)
                .expectCalledWith(expect.objectContaining(newHabitatInput))
                .mockResolvedValueOnce(habitatModel);

            const returnedHabitatModel = await createNewHabitatService.createNewHabitat(newHabitatInput);

            expect(returnedHabitatModel).toEqual(habitatModel);
            expect(eventEmitter.emitAsync).toBeCalledTimes(1);
            expect(eventEmitter.emitAsync).toBeCalledWith(
                expect.stringMatching('habitat.created.after_save'),
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

            when(habitatRepository.getHabitatsByUserId)
                .expectCalledWith(userId)
                .mockResolvedValueOnce([]);

            habitatRepository.save.mockResolvedValueOnce(habitatModel);

            await createNewHabitatService.createHabitatOnUserRegistration(payload);

            expect(eventEmitter.emitAsync).toBeCalledWith(
                expect.stringMatching('habitat.created.after_save'),
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

            when(habitatRepository.getHabitatsByUserId)
                .expectCalledWith(userId)
                .mockResolvedValueOnce([habitatModel]);

            await createNewHabitatService.createHabitatOnUserRegistration(payload);
            expect(habitatRepository.save).toBeCalledTimes(0);
            expect(eventEmitter.emitAsync).toBeCalledTimes(0);
            expect(payload.getHabitatId()).toBe(habitatModel.id);
        });
    });
});