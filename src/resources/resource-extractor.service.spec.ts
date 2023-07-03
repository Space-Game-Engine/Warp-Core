import {
    HabitatResourceModel,
    HabitatResourceRepository,
    QueueElementCostModel
} from "@warp-core/database";
import {AuthorizedHabitatModel} from "@warp-core/auth";
import {Test, TestingModule} from "@nestjs/testing";
import {ResourceExtractorService} from "@warp-core/resources/resource-extractor.service";
import {QueueElementProcessedEvent} from "@warp-core/building-queue";
import {when} from "jest-when";
import {InsufficientResourcesException} from "@warp-core/resources/exception/Insufficient-resources.exception";
import {InsufficientResourceType} from "@warp-core/resources/exception/insufficient-resource.type";

jest.mock("@warp-core/database/repository/habitat-resource.repository");

describe("Resource extraction service", () => {
    let resourceExtractorService: ResourceExtractorService;
    let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
    let authorizedHabitatModel: jest.Mocked<AuthorizedHabitatModel>;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResourceExtractorService,
                HabitatResourceRepository,
                AuthorizedHabitatModel,
            ]
        }).compile();

        resourceExtractorService = module.get<ResourceExtractorService>(ResourceExtractorService);
        habitatResourceRepository = module.get(HabitatResourceRepository);
        authorizedHabitatModel = module.get(AuthorizedHabitatModel);
    });

    describe("useResourcesOnQueueUpdate", () => {
        it("should throw exception in edge case when resources from habitat has less quantity than required resources", async () => {
            authorizedHabitatModel.id = 1;
            const costs = [
                {
                    resource: {
                        id: "wood"
                    },
                    cost: 10
                },
                {
                    resource: {
                        id: "stone"
                    },
                    cost: 10
                },
            ] as QueueElementCostModel[];

            const habitatResources = [
                {
                    resourceId: "wood",
                    currentAmount: 0
                }
            ] as HabitatResourceModel[];

            when(habitatResourceRepository.getHabitatResourcesByIds)
                .expectCalledWith(
                    expect.arrayContaining(["wood", "stone"]),
                    authorizedHabitatModel.id
                )
                .mockResolvedValue(habitatResources);

            await expect(resourceExtractorService.useResourcesOnQueueUpdate({queueElement: {costs: costs}} as QueueElementProcessedEvent))
                .rejects.toThrowError('Requested resources from queue does not equal resources from habitat');
        });

        const insufficientResources = [
            {
                name: "there is single resource that is not enough",
                queueCosts: [
                    {
                        resource: {
                            id: "wood",
                            name: "Wood"
                        },
                        cost: 10
                    },
                ],
                habitatResources: [
                    {
                        resourceId: "wood",
                        currentAmount: 0
                    }
                ],
                exceptionCalculationResults: [
                    {
                        resourceId: "wood",
                        difference: 10
                    }
                ]
            },
            {
                name: "there are multiple resources that are not enough",
                queueCosts: [
                    {
                        resource: {
                            id: "wood",
                            name: "Wood"
                        },
                        cost: 10
                    },
                    {
                        resource: {
                            id: "stone",
                            name: "Stone"
                        },
                        cost: 15
                    },
                ],
                habitatResources: [
                    {
                        resourceId: "wood",
                        currentAmount: 0
                    },
                    {
                        resourceId: "stone",
                        currentAmount: 10
                    },
                ],
                exceptionCalculationResults: [
                    {
                        resourceId: "wood",
                        difference: 10
                    },
                    {
                        resourceId: "stone",
                        difference: 5
                    },
                ]
            },
            {
                name: "there are multiple resources and one is not enough",
                queueCosts: [
                    {
                        resource: {
                            id: "wood",
                            name: "Wood"
                        },
                        cost: 10
                    },
                    {
                        resource: {
                            id: "stone",
                            name: "Stone"
                        },
                        cost: 15
                    },
                ],
                habitatResources: [
                    {
                        resourceId: "wood",
                        currentAmount: 0
                    },
                    {
                        resourceId: "stone",
                        currentAmount: 15
                    },
                ],
                exceptionCalculationResults: [
                    {
                        resourceId: "wood",
                        difference: 10
                    },
                ]
            },
        ];

        describe.each(insufficientResources)('Insufficient resources', (singleCase) => {
            it(`should throw exception when ${singleCase.name}`, async () => {
                authorizedHabitatModel.id = 1;
                const costs = singleCase.queueCosts as QueueElementCostModel[];

                const habitatResources = singleCase.habitatResources as HabitatResourceModel[];

                when(habitatResourceRepository.getHabitatResourcesByIds)
                    .expectCalledWith(
                        expect.arrayContaining(
                            singleCase.exceptionCalculationResults
                                .map((testCase) => testCase.resourceId)
                        ),
                        authorizedHabitatModel.id
                    )
                    .mockResolvedValue(habitatResources);

                try {
                    await resourceExtractorService.useResourcesOnQueueUpdate({queueElement: {costs: costs}} as QueueElementProcessedEvent);
                } catch (e) {
                    expect(e).toBeInstanceOf(InsufficientResourcesException);
                    expect(e.insufficientResources).toHaveLength(singleCase.exceptionCalculationResults.length);
                    const insufficientResources: InsufficientResourceType[] = e.insufficientResources;

                    for (const calculationResult of singleCase.exceptionCalculationResults) {
                        const resourceFromException = insufficientResources
                            .find(
                                (singleResourceFromException) =>
                                    calculationResult.resourceId === singleResourceFromException.resourceId
                            );
                        const queueCost = singleCase.queueCosts.find(
                            (singleElement) =>
                                singleElement.resource.id === calculationResult.resourceId
                        );

                        const habitatResource = singleCase.habitatResources.find(
                            (singleResource) =>
                                singleResource.resourceId === calculationResult.resourceId
                        );
                        expect(resourceFromException.resourceId).toEqual(queueCost.resource.id);
                        expect(resourceFromException.requiredResources).toEqual(queueCost.cost);
                        expect(resourceFromException.currentResources).toEqual(habitatResource.currentAmount);
                        expect(resourceFromException.difference).toEqual(calculationResult.difference);
                    }
                }
            });
        });

        it("should extract resources when user have enough resources to be used", async () => {
            authorizedHabitatModel.id = 1;
            const costs = [
                {
                    resource: {
                        id: "wood"
                    },
                    cost: 10
                },
                {
                    resource: {
                        id: "stone"
                    },
                    cost: 10
                },
            ] as QueueElementCostModel[];

            const habitatResources = [
                {
                    resourceId: "wood",
                    currentAmount: 10
                },
                {
                    resourceId: "stone",
                    currentAmount: 10
                },
            ] as HabitatResourceModel[];

            when(habitatResourceRepository.getHabitatResourcesByIds)
                .expectCalledWith(
                    expect.arrayContaining(["wood", "stone"]),
                    authorizedHabitatModel.id
                )
                .mockResolvedValue(habitatResources);

            await resourceExtractorService.useResourcesOnQueueUpdate({queueElement: {costs: costs}} as QueueElementProcessedEvent);

            expect(habitatResources[0].currentAmount).toEqual(0);
            expect(habitatResources[1].currentAmount).toEqual(0);

            expect(habitatResourceRepository.update).toBeCalledTimes(2);
        });
    });
});