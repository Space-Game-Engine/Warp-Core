import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';
import {DeepPartial} from 'typeorm';

import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {SimpleBuildingCalculationService} from '@warp-core/user/queue/building-queue/add/calculate-resources/simple-building-calculation.service';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

jest.mock('@warp-core/database/repository/building-queue.repository');

describe('Simple calculation of resources for queue element', () => {
	let simpleCalculationService: SimpleBuildingCalculationService;
	let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [SimpleBuildingCalculationService, BuildingQueueRepository],
		}).compile();

		simpleCalculationService = module.get(SimpleBuildingCalculationService);
		buildingQueueRepository = module.get(BuildingQueueRepository);
	});

	const inputsToCalculateResources: {
		name: string;
		addToQueue: Partial<AddToQueueInput>;
		buildingZone: Partial<BuildingZoneModel>;
		building: DeepPartial<BuildingModel>;
		existingBuildingZoneQueue?: Partial<BuildingQueueElementModel>[];
		queueCosts: DeepPartial<QueueElementCostModel>[];
	}[] = [
		{
			name: 'empty queue cost when there were no building details to update',
			addToQueue: {
				endLevel: 2,
			},
			buildingZone: {
				level: 1,
			},
			building: {
				buildingDetailsAtCertainLevel: [],
			},
			queueCosts: [],
		},
		{
			name: 'single resource in queue cost when update require one resource',
			addToQueue: {
				endLevel: 2,
			},
			buildingZone: {
				level: 1,
			},
			building: {
				buildingDetailsAtCertainLevel: [
					{
						details: {level: 1},
					},
					{
						details: {
							level: 2,
							requirements: [
								{
									resource: {
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 5,
								},
							],
						},
					},
				],
			},
			queueCosts: [
				{
					cost: 5,
					resource: {
						type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
					},
				},
			],
		},
		{
			name: 'multiple resources in queue cost when update by one level require two resources',
			addToQueue: {
				endLevel: 2,
			},
			buildingZone: {
				level: 1,
			},
			building: {
				buildingDetailsAtCertainLevel: [
					{
						details: {level: 1},
					},
					{
						details: {
							level: 2,
							requirements: [
								{
									resource: {
										id: 'coal',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 5,
								},
								{
									resource: {
										id: 'wood',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 10,
								},
							],
						},
					},
				],
			},
			queueCosts: [
				{
					resource: {
						id: 'coal',
						type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
					},
					cost: 5,
				},
				{
					resource: {
						id: 'wood',
						type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
					},
					cost: 10,
				},
			],
		},
		{
			name: 'multiple resource types in queue cost when update by one level require two resources',
			addToQueue: {
				endLevel: 2,
			},
			buildingZone: {
				level: 1,
			},
			building: {
				buildingDetailsAtCertainLevel: [
					{
						details: {level: 1},
					},
					{
						details: {
							level: 2,
							requirements: [
								{
									resource: {
										id: 'wood',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 5,
								},
								{
									resource: {
										id: 'coal',
										type: ResourceTypeEnum.ENERGY_RESOURCE,
									},
									cost: 10,
								},
							],
						},
					},
				],
			},
			queueCosts: [
				{
					resource: {
						id: 'wood',
						type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
					},
					cost: 5,
				},
				{
					resource: {
						id: 'coal',
						type: ResourceTypeEnum.ENERGY_RESOURCE,
					},
					cost: 10,
				},
			],
		},
		{
			name: 'single resource in queue cost when update by multiple levels require one resource',
			addToQueue: {
				endLevel: 3,
			},
			buildingZone: {
				level: 1,
			},
			building: {
				buildingDetailsAtCertainLevel: [
					{
						details: {level: 1},
					},
					{
						details: {
							level: 2,
							requirements: [
								{
									resource: {
										id: 'coal',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 5,
								},
							],
						},
					},
					{
						details: {
							level: 3,
							requirements: [
								{
									resource: {
										id: 'coal',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 10,
								},
							],
						},
					},
				],
			},
			queueCosts: [
				{
					resource: {
						id: 'coal',
						type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
					},
					cost: 15,
				},
			],
		},
		{
			name: 'multiple resources in queue cost when update by multiple levels require multiple resources',
			addToQueue: {
				endLevel: 5,
			},
			buildingZone: {
				level: 1,
			},
			building: {
				buildingDetailsAtCertainLevel: [
					{
						details: {level: 1},
					},
					{
						details: {
							level: 2,
							requirements: [
								{
									resource: {
										id: 'coal',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 5,
								},
							],
						},
					},
					{
						details: {
							level: 3,
							requirements: [
								{
									resource: {
										id: 'coal',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 10,
								},
								{
									resource: {
										id: 'wood',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 5,
								},
							],
						},
					},
					{
						details: {
							level: 4,
							requirements: [
								{
									resource: {
										id: 'coal',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 30,
								},
								{
									resource: {
										id: 'wood',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 50,
								},
							],
						},
					},
					{
						details: {
							level: 5,
							requirements: [
								{
									resource: {
										id: 'wood',
										type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
									},
									cost: 75,
								},
							],
						},
					},
				],
			},
			queueCosts: [
				{
					resource: {
						id: 'coal',
						type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
					},
					cost: 45,
				},
				{
					resource: {
						id: 'wood',
						type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
					},
					cost: 130,
				},
			],
		},
		{
			name: 'costs only above end level of last queue element when building zone is already in queue',
			addToQueue: {
				endLevel: 3,
			},
			buildingZone: {
				level: 1,
			},
			building: {
				buildingDetailsAtCertainLevel: [
					{
						details: {level: 1},
					},
					{
						details: {
							level: 2,
							requirements: [{resource: {id: 'wood'}, cost: 10}],
						},
					},
					{
						details: {
							level: 3,
							requirements: [{resource: {id: 'wood'}, cost: 25}],
						},
					},
				],
			},
			existingBuildingZoneQueue: [{endLevel: 2}],
			queueCosts: [{resource: {id: 'wood'}, cost: 25}],
		},
	];

	describe.each(inputsToCalculateResources)(
		'calculateResourcesCosts',
		singleData => {
			it(`'should return ${singleData.name}`, async () => {
				const addToQueue = singleData.addToQueue as AddToQueueInput;
				const buildingZone = singleData.buildingZone as BuildingZoneModel;
				const building = singleData.building as BuildingModel;

				when(buildingQueueRepository.getCurrentBuildingQueueForBuildingZone)
					.expectCalledWith(buildingZone)
					.mockResolvedValueOnce(
						(singleData.existingBuildingZoneQueue ??
							[]) as BuildingQueueElementModel[],
					);

				const queueCosts =
					await simpleCalculationService.calculateResourcesCosts(
						addToQueue,
						buildingZone,
						building,
					);

				expect(queueCosts).toHaveLength(singleData.queueCosts.length);
				expect(queueCosts).toEqual(singleData.queueCosts);
			});
		},
	);
});
