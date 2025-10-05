import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';
import {DateTime} from 'luxon';

import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {CalculationMechanic} from '@warp-core/user/resources/service/calculate/resource-calculation/calculation-mechanic.interface';
import {ResourceCalculatorService} from '@warp-core/user/resources/service/calculate/resource-calculator.service';
import {WarehouseStorageCalculationMechanic} from '@warp-core/user/resources/service/calculate/warehouse-storage/warehouse-storage-calculation-mechanic.interface';

jest.mock('@warp-core/database/repository/habitat-resource.repository');
jest.mock(
	'@warp-core/user/resources/service/calculate/warehouse-storage/base-resource-storage.service',
);

describe('Resources calculator service test', () => {
	let resourcesCalculator: ResourceCalculatorService;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let warehouseStorage: jest.Mocked<WarehouseStorageCalculationMechanic>;
	let calculateMechanic: jest.Mocked<CalculationMechanic>;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResourceCalculatorService,
				HabitatResourceRepository,
				{
					provide: WarehouseStorageCalculationMechanic,
					useValue: {
						calculateStorage: jest.fn(),
					} as WarehouseStorageCalculationMechanic,
				},
				{
					provide: CalculationMechanic,
					useValue: {
						calculateCurrentResourceValue: jest.fn(),
						getProductionRate: jest.fn(),
					} as CalculationMechanic,
				},
			],
		}).compile();

		resourcesCalculator = module.get<ResourceCalculatorService>(
			ResourceCalculatorService,
		);
		habitatResourceRepository = module.get(HabitatResourceRepository);
		warehouseStorage = module.get(WarehouseStorageCalculationMechanic);
		calculateMechanic = module.get(CalculationMechanic);

		when(warehouseStorage.calculateStorage).defaultResolvedValue(
			Number.MAX_VALUE,
		);
	});

	describe('calculateSingleResource', () => {
		it('should not calculate any resource when there are no building zones for provided resource', async () => {
			const habitatResource = {
				id: '1',
				currentAmount: 0,
				resourceId: 'different resource',
				habitatId: 5,
			} as HabitatResourceModel;

			calculateMechanic.calculateCurrentResourceValue.mockResolvedValue(0);
			warehouseStorage.calculateStorage.mockResolvedValue(100);

			await resourcesCalculator.calculateSingleResource(habitatResource);

			expect(habitatResource.currentAmount).toEqual(0);
		});

		it('should return calculated value of resources when it is in storage range', async () => {
			const habitatResource = {
				id: '1',
				currentAmount: 0,
				resourceId: 'wood',
				habitatId: 5,
			} as HabitatResourceModel;

			calculateMechanic.calculateCurrentResourceValue.mockResolvedValue(10);
			warehouseStorage.calculateStorage.mockResolvedValue(100);

			await resourcesCalculator.calculateSingleResource(habitatResource);

			expect(habitatResource.currentAmount).toEqual(10);
		});

		it('should return reduced value of resources when it is out of storage range', async () => {
			const habitatResource = {
				id: '1',
				currentAmount: 0,
				resourceId: 'wood',
				habitatId: 5,
			} as HabitatResourceModel;

			calculateMechanic.calculateCurrentResourceValue.mockResolvedValue(200);
			warehouseStorage.calculateStorage.mockResolvedValue(100);

			await resourcesCalculator.calculateSingleResource(habitatResource);

			expect(habitatResource.currentAmount).toEqual(100);
		});
	});

	describe('addResourcesOnQueueUpdate', () => {
		it('should update resource on queue update for building zone with single resource', async () => {
			const habitatModel = {id: 5} as HabitatModel;
			const now = new Date();
			const building = {id: 'mine'} as BuildingModel;
			const buildingZone = {
				id: 1,
				habitatId: habitatModel.id,
				habitat: habitatModel,
			} as BuildingZoneModel;
			const buildingQueueElement = {
				building,
				buildingZone,
				buildingZoneId: buildingZone.id,
				startLevel: 1,
				endTime: now,
			} as BuildingQueueElementModel;
			const resource = {id: 'wood'} as ResourceModel;

			const habitatResource = {
				id: '1',
				currentAmount: 0,
				resourceId: 'wood',
				habitatId: habitatModel.id,
				habitat: habitatModel,
				lastCalculationTime: DateTime.now().minus(10000).toJSDate(),
				resource,
			} as HabitatResourceModel;

			when(habitatResourceRepository.getHabitatResourceByBuildingAndLevel)
				.expectCalledWith(
					building,
					buildingQueueElement.startLevel,
					buildingZone.habitatId,
				)
				.mockResolvedValue([habitatResource]);

			when(calculateMechanic.calculateCurrentResourceValue)
				.calledWith(habitatResource, expect.any(Number))
				.mockResolvedValue(20);
			when(warehouseStorage.calculateStorage)
				.calledWith(resource, habitatModel)
				.mockResolvedValue(100);

			await resourcesCalculator.addResourcesOnQueueUpdate({
				queueElement: buildingQueueElement,
			});

			expect(habitatResource.currentAmount).toEqual(20);
			expect(habitatResource.lastCalculationTime.getTime()).toEqual(
				now.getTime(),
			);

			expect(habitatResourceRepository.save).toHaveBeenCalledTimes(1);
		});
	});
});
