import { Test, TestingModule } from "@nestjs/testing";
import { AuthorizedHabitatModel } from "@warp-core/auth";
import {
    BuildingProductionRateModel, BuildingQueueElementModel,
    BuildingZoneModel,
    BuildingZoneRepository,
    HabitatResourceModel,
    HabitatResourceRepository
} from "@warp-core/database";
import { ResourceCalculatorService } from "@warp-core/resources/resource-calculator.service";
import { when } from "jest-when";
import { DateTime } from "luxon";

jest.mock("@warp-core/database/repository/habitat-resource.repository");
jest.mock("@warp-core/database/repository/building-zone.repository");

describe("Resources calculator service test", () => {

    let resourcesCalculator: ResourceCalculatorService;
    let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
    let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
    let authorizedHabitatModel: jest.Mocked<AuthorizedHabitatModel>;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResourceCalculatorService,
                HabitatResourceRepository,
                BuildingZoneRepository,
                AuthorizedHabitatModel,
            ]
        }).compile();

        resourcesCalculator = module.get<ResourceCalculatorService>(ResourceCalculatorService);
        habitatResourceRepository = module.get(HabitatResourceRepository);
        buildingZoneRepository = module.get(BuildingZoneRepository);
        authorizedHabitatModel = module.get(AuthorizedHabitatModel);
    });

    describe("calculateSingleResource", () => {
        it("should not calculate any resource when there are no building zones for provided resource", async () => {
            const habitatResource = {
                id: "1",
                currentAmount: 0,
                resource: {
                    id: "different resource"
                }
            } as HabitatResourceModel;

            authorizedHabitatModel.id = 5;

            when(buildingZoneRepository.getBuildingZonesForSingleResource)
                .expectCalledWith(
                    authorizedHabitatModel,
                    await habitatResource.resource
                ).mockResolvedValue([]);

            await resourcesCalculator.calculateSingleResource(habitatResource);

            expect(habitatResource.currentAmount).toEqual(0);
        });

        const singleBuildingZonesAndOneResourceCases = [
            {
                secondsToCalculate: 10,
                currentAmount: 0,
                productionRate: 1,
                result: 10
            },
            {
                secondsToCalculate: 100,
                currentAmount: 0,
                productionRate: 1,
                result: 100
            },
            {
                secondsToCalculate: 5,
                currentAmount: 0,
                productionRate: 2,
                result: 10
            },
            {
                secondsToCalculate: 5,
                currentAmount: 0,
                productionRate: 1.8,
                result: 9
            },
            {
                secondsToCalculate: 5,
                currentAmount: 0,
                productionRate: 2.3,
                result: 12
            },
            {
                secondsToCalculate: 10,
                currentAmount: 5,
                productionRate: 1,
                result: 15
            },
            {
                secondsToCalculate: 5,
                currentAmount: 10,
                productionRate: 2.3,
                result: 22
            },
            {
                secondsToCalculate: 5,
                currentAmount: 10,
                productionRate:0,
                result:  10
            },
        ];

        describe.each(singleBuildingZonesAndOneResourceCases)("For single buildingZone and one resource", (buildingZoneResource) => {
            it(`should calculate resources amount with production rate ${buildingZoneResource.productionRate} for ${buildingZoneResource.secondsToCalculate}s`, async () => {
                const habitatResource = {
                    id: "1",
                    currentAmount: buildingZoneResource.currentAmount,
                    lastCalculationTime: DateTime.now().minus({second: buildingZoneResource.secondsToCalculate}).toJSDate(),
                    resource: {
                        id: "wood"
                    }
                } as HabitatResourceModel;

                const buildingZone = {
                    id: 1,
                    level: 1,
                    building: {
                        buildingDetailsAtCertainLevel: [{
                            level: 1,
                            productionRate: [{
                                productionRate: buildingZoneResource.productionRate
                            }]
                        }]
                    }
                } as BuildingZoneModel;

                authorizedHabitatModel.id = 5;

                when(buildingZoneRepository.getBuildingZonesForSingleResource)
                    .expectCalledWith(
                        authorizedHabitatModel,
                        await habitatResource.resource
                    ).mockResolvedValue([
                        buildingZone
                    ]);

                await resourcesCalculator.calculateSingleResource(habitatResource);

                expect(habitatResource.currentAmount).toEqual(buildingZoneResource.result);
            });
        });

        const multipleBuildingZonesAndSingleResourceCases = [
            {
                secondsToCalculate: 10,
                currentAmount: 0,
                result: 20,
                buildingZones: [
                    {
                        productionRate: 1,
                    },
                    {
                        productionRate: 1,
                    },
                ],
            },
            {
                secondsToCalculate: 100,
                currentAmount: 0,
                result: 200,
                buildingZones: [
                    {
                        productionRate: 1,
                    },
                    {
                        productionRate: 1,
                    },
                ],
            },
            {
                secondsToCalculate: 100,
                currentAmount: 10,
                result: 210,
                buildingZones: [
                    {
                        productionRate: 1,
                    },
                    {
                        productionRate: 1,
                    },
                ],
            },
            {
                secondsToCalculate: 10,
                currentAmount: 10,
                result: 60,
                buildingZones: [
                    {
                        productionRate: 0.5,
                    },
                    {
                        productionRate: 1,
                    },
                    {
                        productionRate: 1.5,
                    },
                    {
                        productionRate: 2,
                    },
                ],
            },
            {
                secondsToCalculate: 10,
                currentAmount: 10,
                result: 20,
                buildingZones: [
                    {
                        productionRate: 0,
                    },
                    {
                        productionRate: 0,
                    },
                    {
                        productionRate: 1,
                    },
                    {
                        productionRate: 0,
                    },
                ],
            },
        ];

        describe.each(multipleBuildingZonesAndSingleResourceCases)("For multiple buildingZones and one resource", (buildingZoneResource) => {
            it(`should calculate resources amount for multiple building zones`, async () => {
                const habitatResource = {
                    id: "1",
                    currentAmount: buildingZoneResource.currentAmount,
                    lastCalculationTime: DateTime.now().minus({second: buildingZoneResource.secondsToCalculate}).toJSDate(),
                    resource: {
                        id: "stone"
                    }
                } as HabitatResourceModel;

                const buildingZones = buildingZoneResource.buildingZones.map((buildingZoneDetails, index) => {
                    return {
                        id: index,
                        level: 1,
                        building: {
                            buildingDetailsAtCertainLevel: [{
                                level: 1,
                                productionRate: [{
                                    productionRate: buildingZoneDetails.productionRate
                                }]
                            }]
                        }
                    } as BuildingZoneModel
                });

                authorizedHabitatModel.id = 5;

                when(buildingZoneRepository.getBuildingZonesForSingleResource)
                    .expectCalledWith(
                        authorizedHabitatModel,
                        await habitatResource.resource
                    ).mockResolvedValue(buildingZones);

                await resourcesCalculator.calculateSingleResource(habitatResource);

                expect(habitatResource.currentAmount).toEqual(buildingZoneResource.result);
            });
        });
    });

    describe("calculateOnQueueUpdate", () => {
        it("should update resource on queue update for building zone with single resource", async () => {
            const secondsToCalculate = 10;
            const queueElement = {
                startLevel: 1,
                endLevel: 2,
                building: {
                    id: 5
                }
            } as BuildingQueueElementModel;

            const habitatResource = {
                id: "1",
                currentAmount: 10,
                lastCalculationTime: DateTime.now().minus({second: secondsToCalculate}).toJSDate(),
                resource: {
                    id: "wood"
                }
            } as HabitatResourceModel;

            const buildingZone = {
                id: 1,
                level: 1,
                building: {
                    buildingDetailsAtCertainLevel: [{
                        level: 1,
                        productionRate: [{
                            productionRate: 1
                        }]
                    }]
                }
            } as BuildingZoneModel;

            authorizedHabitatModel.id = 5;

            when(habitatResourceRepository.getHabitatResourceByBuildingAndLevel)
                .expectCalledWith(
                    await queueElement.building,
                    queueElement.startLevel
                )
                .mockResolvedValue([habitatResource]);

            when(buildingZoneRepository.getBuildingZonesForSingleResource)
                .expectCalledWith(
                    authorizedHabitatModel,
                    await habitatResource.resource
                ).mockResolvedValue([buildingZone]);

            await resourcesCalculator.addResourcesOnQueueUpdate({queueElement: queueElement});

            expect(habitatResource.currentAmount).toEqual(20);
            expect(habitatResourceRepository.save).toBeCalledTimes(1);
        });

        it("should update resource on queue update for building zone with multiple resources", async () => {
            const secondsToCalculate = 10;
            const queueElement = {
                startLevel: 1,
                endLevel: 2,
                building: {
                    id: 5
                }
            } as BuildingQueueElementModel;

            const habitatResource1 = {
                id: "1",
                currentAmount: 10,
                lastCalculationTime: DateTime.now().minus({second: secondsToCalculate}).toJSDate(),
                resource: {
                    id: "wood"
                }
            } as HabitatResourceModel;

            const habitatResource2 = {
                id: "1",
                currentAmount: 5,
                lastCalculationTime: DateTime.now().minus({second: secondsToCalculate}).toJSDate(),
                resource: {
                    id: "steel"
                }
            } as HabitatResourceModel;

            const buildingZoneForWood = {
                id: 1,
                level: 1,
                building: {
                    buildingDetailsAtCertainLevel: [{
                        level: 1,
                        productionRate: [{
                            productionRate: 1,
                            resourceId: "wood"
                        }]
                    }]
                }
            } as BuildingZoneModel;

            const buildingZoneForSteel = {
                id: 1,
                level: 1,
                building: {
                    buildingDetailsAtCertainLevel: [{
                        level: 1,
                        productionRate: [{
                            productionRate: 0.5,
                            resourceId: "steel"
                        }]
                    }]
                }
            } as BuildingZoneModel;

            authorizedHabitatModel.id = 5;

            when(habitatResourceRepository.getHabitatResourceByBuildingAndLevel)
                .expectCalledWith(
                    await queueElement.building,
                    queueElement.startLevel
                )
                .mockResolvedValue([habitatResource1, habitatResource2]);

            when(buildingZoneRepository.getBuildingZonesForSingleResource)
                .calledWith(
                    authorizedHabitatModel,
                    await habitatResource1.resource
                ).mockResolvedValue([buildingZoneForWood])
                .calledWith(
                    authorizedHabitatModel,
                    await habitatResource2.resource
                ).mockResolvedValue([buildingZoneForSteel]);

            await resourcesCalculator.addResourcesOnQueueUpdate({queueElement: queueElement});

            expect(habitatResource1.currentAmount).toEqual(20);
            expect(habitatResource2.currentAmount).toEqual(10);
            expect(habitatResourceRepository.save).toBeCalledTimes(2);
        });
    });
});