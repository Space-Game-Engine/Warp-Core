import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {CalculationMechanic} from '@warp-core/user/resources/service/calculate/resource-calculation/calculation-mechanic.interface';
import {ResourceCalculatorService} from '@warp-core/user/resources/service/calculate/resource-calculator.service';
import {WarehouseStorageCalculationMechanic} from '@warp-core/user/resources/service/calculate/warehouse-storage/warehouse-storage-calculation-mechanic.interface';

jest.mock('@warp-core/database/repository/habitat-resource.repository');
jest.mock(
	'@warp-core/user/resources/service/calculate/warehouse-storage/base-resource-storage.service',
);

describe('Resources calculator service test', () => {
	let resourcesCalculator: ResourceCalculatorService;
	let warehouseStorage: jest.Mocked<WarehouseStorageCalculationMechanic>;
	let calculateMechanic: jest.Mocked<CalculationMechanic>;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResourceCalculatorService,
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
});
