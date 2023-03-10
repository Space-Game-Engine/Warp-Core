import { Test, TestingModule } from "@nestjs/testing";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { HabitatRepository } from "@warp-core/database/repository/habitat.repository";
import { DataSource } from "typeorm";

describe("Habitat repository test", () => {
    let habitatRepository: HabitatRepository;
    let findOneHabitatSpy: jest.SpyInstance;
    let findHabitatSpy: jest.SpyInstance;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HabitatRepository,
                {
                    provide: DataSource,
                    useValue: {
                        createEntityManager() {},
                    }
                }
            ]
        }).compile();

        habitatRepository = module.get<HabitatRepository>(HabitatRepository);
        findOneHabitatSpy = jest.spyOn(habitatRepository, 'findOne');
        findHabitatSpy = jest.spyOn(habitatRepository, 'find');
    });

    test('habitat repository object should be defined', () => {
        expect(habitatRepository).toBeDefined();
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

            const returnedHabitatModel = await habitatRepository.getHabitatById(habitatModel.id);

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

            const returnedHabitatModels = await habitatRepository.getHabitatsByUserId(habitatModel.userId);

            expect(returnedHabitatModels).toEqual([habitatModel]);
            expect(findHabitatSpy).toBeCalledTimes(1);
            expect(findHabitatSpy).toBeCalledWith(expect.objectContaining({
                where: {
                    userId: habitatModel.userId
                }
            }));
        });
    });
});