import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { HabitatService } from "./habitat.service";
import { when } from "jest-when";
import { NewHabitatInput } from "@warp-core/habitat/input/NewHabitatInput";
import { RegisterUserEvent } from "@warp-core/auth/register/register-user.event";
import { AuthorizedHabitatModel } from "@warp-core/auth";
import { HabitatModel, HabitatRepository } from "@warp-core/database";

jest.mock(".@warp-core/database/repository/habitat.repository");
jest.mock("../auth/payload/model/habitat.model");

describe("Habitat service tests", () => {
    let habitatService: HabitatService;
    let eventEmitter: EventEmitter2;
    let authorizedHabitatModel: AuthorizedHabitatModel;
    let habitatRepository: jest.Mocked<HabitatRepository>;

    beforeEach(async () => {
        jest.clearAllMocks();

        eventEmitter = {
            emitAsync: jest.fn()
        } as any as EventEmitter2;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HabitatService,
                HabitatRepository,
                AuthorizedHabitatModel,
                {
                    provide: EventEmitter2,
                    useValue: eventEmitter
                },
            ]
        }).compile();

        habitatService = module.get<HabitatService>(HabitatService);
        habitatRepository = module.get(HabitatRepository);
        authorizedHabitatModel = module.get(AuthorizedHabitatModel);
    });

    describe("getHabitatsForLoggedIn", () => {
        it("should return array of habitats when habitats for user id exists", async () => {
            const userId = 5;
            const habitatModels = [
                {
                    id: 10,
                    name: "test",
                    userId: userId,
                    isMain: true,
                    buildingZones: [],
                }, {
                    id: 20,
                    name: "test",
                    userId: userId,
                    isMain: false,
                    buildingZones: [],
                },
            ] as HabitatModel[];

            authorizedHabitatModel.userId = userId;

            when(habitatRepository.getHabitatsByUserId)
                .expectCalledWith(userId)
                .mockResolvedValueOnce(habitatModels);

            const returnedHabitats = await habitatService.getHabitatsForLoggedIn();

            expect(returnedHabitats).toEqual(habitatModels);
        });

        it("should return empty array of habitats when user don't have any habitats", async () => {
            const userId = 5;
            const habitatModels = [] as HabitatModel[];

            authorizedHabitatModel.userId = userId;

            when(habitatRepository.getHabitatsByUserId)
                .expectCalledWith(userId)
                .mockResolvedValueOnce(habitatModels);

            const returnedHabitats = await habitatService.getHabitatsForLoggedIn();

            expect(returnedHabitats).toEqual(habitatModels);
        });
    });

    describe("getCurrentHabitat", () => {
        it("should return a single habitat for currently logged in user", async () => {
            const habitatId = 10;

            authorizedHabitatModel.id = habitatId;

            const returnedHabitat = await habitatService.getCurrentHabitat();
            expect(returnedHabitat).toEqual(authorizedHabitatModel);
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

            when(habitatRepository.save)
                .expectCalledWith(expect.objectContaining(newHabitatInput))
                .mockResolvedValueOnce(habitatModel);

            const returnedHabitatModel = await habitatService.createNewHabitat(newHabitatInput);

            expect(returnedHabitatModel).toEqual(habitatModel);
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

            when(habitatRepository.getHabitatsByUserId)
                .expectCalledWith(userId)
                .mockResolvedValueOnce([]);

            habitatRepository.save.mockResolvedValueOnce(habitatModel);

            await habitatService.createHabitatOnUserRegistration(payload);

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

            when(habitatRepository.getHabitatsByUserId)
                .expectCalledWith(userId)
                .mockResolvedValueOnce([habitatModel]);

            await habitatService.createHabitatOnUserRegistration(payload);
            expect(habitatRepository.save).toBeCalledTimes(0);
            expect(eventEmitter.emitAsync).toBeCalledTimes(0);
            expect(payload.getHabitatId()).toBe(habitatModel.id);
        });
    });
});