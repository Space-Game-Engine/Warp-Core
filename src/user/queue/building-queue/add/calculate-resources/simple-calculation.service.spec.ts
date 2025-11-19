import {Test, TestingModule} from '@nestjs/testing';

import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {SimpleCalculationService} from '@warp-core/user/queue/building-queue/add/calculate-resources/simple-calculation.service';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

describe('Simple calculation of resources for queue element', () => {
	let simpleCalculationService: SimpleCalculationService;
	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [SimpleCalculationService],
		}).compile();

		simpleCalculationService = module.get(SimpleCalculationService);
	});

	const inputsToCalculateResources = [
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
						level: 1,
					},
					{
						level: 2,
						requirements: [
							{
								resource: {
									type: ResourceTypeEnum.TECHNOLOGY_RESOURCE,
								},
								cost: 5,
							},
						],
					},
				],
			},
			queueCosts: [
				{
					cost: 5,
					resource: {
						type: ResourceTypeEnum.TECHNOLOGY_RESOURCE,
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
						level: 1,
					},
					{
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
						level: 1,
					},
					{
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
						level: 1,
					},
					{
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
					{
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
						level: 1,
					},
					{
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
					{
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
					{
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
					{
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
	];

	describe.each(inputsToCalculateResources)(
		'calculateResourcesCosts',
		singleData => {
			it(`'should return ${singleData.name}`, async () => {
				const addToQueue = singleData.addToQueue as AddToQueueInput;
				const buildingZone = singleData.buildingZone as BuildingZoneModel;
				const building = singleData.building as BuildingModel;

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
