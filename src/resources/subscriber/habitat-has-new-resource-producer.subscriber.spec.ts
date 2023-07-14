import {
    BuildingQueueElementModel,
    BuildingZoneRepository,
    HabitatResourceModel,
    HabitatResourceRepository
} from "@warp-core/database";
import {AuthorizedHabitatModel} from "@warp-core/auth";
import {prepareRepositoryMock} from "@warp-core/test/database/repository/prepare-repository-mock";
import {Test, TestingModule} from "@nestjs/testing";
import {when} from "jest-when";
import {
    HabitatHasNewResourceProducerSubscriber
} from "@warp-core/resources/subscriber/habitat-has-new-resource-producer.subscriber";

jest.mock("@warp-core/database/repository/building-zone.repository");
jest.mock("@warp-core/database/repository/habitat-resource.repository");

describe("Add last calculation date for new resource producers", () => {
    let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
    let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
    let authorizedHabitatModel: AuthorizedHabitatModel;
    let habitatHasNewResourceProducerSubscriber: HabitatHasNewResourceProducerSubscriber;

    beforeAll(() => {
        prepareRepositoryMock(HabitatResourceRepository);
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingZoneRepository,
                HabitatResourceRepository,
                AuthorizedHabitatModel,
                HabitatHasNewResourceProducerSubscriber,
            ]
        }).compile();

        buildingZoneRepository = module.get(BuildingZoneRepository);
        habitatResourceRepository = module.get(HabitatResourceRepository);
        authorizedHabitatModel = module.get(AuthorizedHabitatModel);
        habitatHasNewResourceProducerSubscriber = module.get(HabitatHasNewResourceProducerSubscriber);
    });

    describe("updateLastCalculationDateOnHabitatResource", () => {
        it("should do nothing when habitat resource models has calculation times", async () => {
            authorizedHabitatModel.id = 5;
            const queueElement = {
                endLevel: 5,
                building: {
                    id: 1
                }
            } as BuildingQueueElementModel;

            const habitatResourceModels = [
                {
                    lastCalculationTime: new Date(),
                    id: "wood"
                },
                {
                    lastCalculationTime: new Date(),
                    id: "stone"
                },
            ] as HabitatResourceModel[];

            when(habitatResourceRepository.getHabitatResourceByBuildingAndLevel)
                .expectCalledWith(
                    await queueElement.building,
                    queueElement.endLevel,
                    authorizedHabitatModel.id
                )
                .mockResolvedValue(habitatResourceModels);

            await habitatHasNewResourceProducerSubscriber.updateLastCalculationDateOnHabitatResource(
                {queueElement: queueElement},
                'abc'
            );

            expect(
                habitatResourceRepository.getSharedTransaction
            ).toBeCalledTimes(0);
        });
        it("should update habitat resource when it don't have last calculation date", async () => {
            authorizedHabitatModel.id = 5;
            const queueElement = {
                endLevel: 5,
                building: {
                    id: 1
                }
            } as BuildingQueueElementModel;

            const habitatResourceModels = [
                {
                    lastCalculationTime: null,
                    id: "wood"
                },
                {
                    lastCalculationTime: new Date(),
                    id: "stone"
                },
            ] as HabitatResourceModel[];

            when(habitatResourceRepository.getHabitatResourceByBuildingAndLevel)
                .expectCalledWith(
                    await queueElement.building,
                    queueElement.endLevel,
                    authorizedHabitatModel.id
                )
                .mockResolvedValue(habitatResourceModels);

            await habitatHasNewResourceProducerSubscriber.updateLastCalculationDateOnHabitatResource(
                {queueElement: queueElement},
                'abc'
            );

            expect(
                habitatResourceModels[0].lastCalculationTime
            ).toBeInstanceOf(Date);

            expect(
                habitatResourceRepository.getSharedTransaction
            ).toBeCalledTimes(1);

            const entityManager = habitatResourceRepository.getSharedTransaction('abc');

            expect(entityManager.update)
                .toBeCalledTimes(1);
            expect(entityManager.update)
                .toBeCalledWith(
                    HabitatResourceModel,
                    habitatResourceModels[0].id,
                    {lastCalculationTime: habitatResourceModels[0].lastCalculationTime}
                )
        });
    });
});