import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { when } from 'jest-when';
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { BuildingService } from "@warp-core/building";
import {
    BuildingModel,
    BuildingQueueElementModel,
    BuildingQueueRepository,
    BuildingZoneModel,
    BuildingZoneRepository,
    HabitatModel,
    QueueElementCostModel
} from "@warp-core/database";
import { AuthorizedHabitatModel } from "@warp-core/auth";
import {EventEmitter2} from "@nestjs/event-emitter";
import {
    ResourcesCalculatorInterface
} from "@warp-core/building-queue/add/calculate-resources/resources-calculator.interface";
import {
    PrepareSingleBuildingQueueElementService
} from "@warp-core/building-queue/add/prepare-single-building-queue-element.service";

jest.mock("@warp-core/database/repository/building-queue.repository");
jest.mock("@warp-core/database/repository/building-zone.repository");
jest.mock("@warp-core/auth/payload/model/habitat.model");
jest.mock("@warp-core/building/building.service");
jest.mock("@nestjs/config");
jest.mock("@nestjs/event-emitter");

describe("Building queue add service tests", () => {
    let prepareBuildingQueueElement: PrepareSingleBuildingQueueElementService;
    let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
    let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
    let buildingService: jest.Mocked<BuildingService>;
    let habitatMock: jest.Mocked<AuthorizedHabitatModel>;
    let configService: jest.Mocked<ConfigService>;
    let eventEmitter: jest.Mocked<EventEmitter2>;
    let resourcesCalculator: ResourcesCalculatorInterface;

    beforeEach(async () => {
        jest.clearAllMocks();

        resourcesCalculator = {
            calculateResourcesCosts: jest.fn()
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PrepareSingleBuildingQueueElementService,
                BuildingQueueRepository,
                BuildingZoneRepository,
                BuildingService,
                ConfigService,
                AuthorizedHabitatModel,
                EventEmitter2,
                {
                    provide: 'QUEUE_ADD_CALCULATION',
                    useValue: resourcesCalculator
                },
            ]
        }).compile();

        prepareBuildingQueueElement = module.get<PrepareSingleBuildingQueueElementService>(PrepareSingleBuildingQueueElementService);
        buildingQueueRepository = module.get(BuildingQueueRepository);
        buildingZoneRepository = module.get(BuildingZoneRepository);
        buildingService = module.get(BuildingService);
        configService = module.get(ConfigService);
        habitatMock = module.get(AuthorizedHabitatModel);
        eventEmitter = module.get(EventEmitter2);

    });

    const testCases = [
        {
            name: "it is first queue element without building in building zone",
            addToQueueInput: {
                localBuildingZoneId: 1,
                endLevel: 1,
                buildingId: 1
            },
            buildingZone: {
                id: 1,
                level: 0,
                building: null
            },
            building: {
                id: 10,
            },
            resourcesCosts: [
                {
                    resource: {
                        id: "wood"
                    },
                    cost: 5
                }
            ],
            existingQueue: [],
            buildingTime: 10,
        },
        {
            name: "it is first queue element with building in building zone",
            addToQueueInput: {
                localBuildingZoneId: 1,
                endLevel: 1,
                buildingId: 1
            },
            buildingZone: {
                id: 1,
                level: 0,
                building: {}
            },
            building: {
                id: 10,
            },
            resourcesCosts: [
                {
                    resource: {
                        id: "wood"
                    },
                    cost: 5
                }
            ],
            existingQueue: [],
            buildingTime: 10,
        },
        {
            name: "it is next queue element with multiple level update",
            addToQueueInput: {
                localBuildingZoneId: 1,
                endLevel: 5,
                buildingId: 1
            },
            buildingZone: {
                id: 1,
                level: 1,
                building: {}
            },
            building: {
                id: 10,
            },
            resourcesCosts: [
                {
                    resource: {
                        id: "wood"
                    },
                    cost: 500
                }
            ],
            existingQueue: [],
            buildingTime: 100,
        },
        {
            name: "it is next queue element with multiple level update and there is something in existing queue",
            addToQueueInput: {
                localBuildingZoneId: 1,
                endLevel: 5,
                buildingId: 1
            },
            buildingZone: {
                id: 1,
                level: 1,
                building: {}
            },
            building: {
                id: 10,
            },
            resourcesCosts: [
                {
                    resource: {
                        id: "wood"
                    },
                    cost: 500
                }
            ],
            existingQueue: [
                {
                    endTime: new Date(Date.now() + 10000)
                }
            ],
            buildingTime: 100,
        },
    ];

    describe.each(testCases)("getQueueElement", (singleTestCase) => {
        it(`should create draft queue element when ${singleTestCase.name}`, async () => {
            habitatMock.id = 5;

            const addToQueueInput = singleTestCase.addToQueueInput as AddToQueueInput;
            const buildingZone = singleTestCase.buildingZone as BuildingZoneModel;
            buildingZone.habitatId = habitatMock.id;

            const building = singleTestCase.building as BuildingModel;

            if (buildingZone.building !== null) {
                buildingZone.building = building;
            }

            const existingQueue = singleTestCase.existingQueue as BuildingQueueElementModel[];
            const buildingTime = singleTestCase.buildingTime;
            const resourcesCosts = singleTestCase.resourcesCosts as QueueElementCostModel[];

            when(buildingZoneRepository.getSingleBuildingZone)
                .expectCalledWith(
                    addToQueueInput.localBuildingZoneId,
                    habitatMock.id
                ).mockResolvedValue(buildingZone);

            if (buildingZone.building === null) {
                when(buildingService.getBuildingById)
                    .expectCalledWith(
                        addToQueueInput.buildingId
                    ).mockResolvedValue(building);
            } else {
                expect(buildingService.getBuildingById)
                    .toBeCalledTimes(0);
            }
            when(resourcesCalculator.calculateResourcesCosts)
                .expectCalledWith(
                    addToQueueInput,
                    buildingZone,
                    building
                ).mockResolvedValue(resourcesCosts);
            when(buildingQueueRepository.getCurrentBuildingQueueForHabitat)
                .expectCalledWith(habitatMock.id)
                .mockResolvedValue(existingQueue);
            when(buildingService.calculateTimeInSecondsToUpgradeBuilding)
                .expectCalledWith(
                    buildingZone.level,
                    addToQueueInput.endLevel,
                    building.id
                ).mockResolvedValue(buildingTime);

            const queueDraft = await prepareBuildingQueueElement.getQueueElement(addToQueueInput);

            expect(queueDraft.id).toBeNull();
            expect(queueDraft.buildingId).toEqual(building.id);
            expect(queueDraft.buildingZone).toEqual(buildingZone);
            expect(queueDraft.buildingZoneId).toEqual(buildingZone.id);
            expect(queueDraft.startTime).toBeInstanceOf(Date);
            expect(queueDraft.startLevel).toEqual(buildingZone.level);
            expect(queueDraft.endLevel).toEqual(addToQueueInput.endLevel);
            expect(queueDraft.endTime.getTime()).toEqual(queueDraft.startTime.getTime() + buildingTime * 1000);
            expect(queueDraft.isConsumed).toEqual(false);
            expect(queueDraft.costs).toEqual(resourcesCosts);
        });
    });
});
