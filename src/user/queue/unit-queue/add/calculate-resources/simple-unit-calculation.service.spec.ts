import {Test, TestingModule} from '@nestjs/testing';

import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {SimpleUnitCalculationService} from '@warp-core/user/queue/unit-queue/add/calculate-resources/simple-unit-calculation.service';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

describe('Simple unit calculation service', () => {
	let simpleUnitCalculationService: SimpleUnitCalculationService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [SimpleUnitCalculationService],
		}).compile();

		simpleUnitCalculationService = module.get(SimpleUnitCalculationService);
	});

	describe('calculateResourcesCosts', () => {
		const wood = {id: 'wood'};
		const stone = {id: 'stone'};

		it('should multiply cost of every resource by amount of units', async () => {
			const unit = {
				requirements: [
					{resource: wood, cost: 10},
					{resource: stone, cost: 3},
					{resource: wood, cost: 5},
				],
			} as unknown as UnitBlueprintGlobalModel;

			const costs = await simpleUnitCalculationService.calculateResourcesCosts(
				{unitId: 'engineer', amount: 4} as AddUnitToQueueInput,
				unit,
			);

			expect(costs).toEqual([
				{resource: wood, cost: 60},
				{resource: stone, cost: 12},
			]);
		});

		it('should skip requirements that are not resource costs', async () => {
			const unit = {
				requirements: [
					{resource: wood, cost: 10},
					{buildingId: 'train_factory', buildingLevel: 1},
				] as RequirementsPerLevelModel[],
			} as UnitBlueprintGlobalModel;

			const costs = await simpleUnitCalculationService.calculateResourcesCosts(
				{unitId: 'engineer', amount: 2} as AddUnitToQueueInput,
				unit,
			);

			expect(costs).toEqual([{resource: wood, cost: 20}]);
		});

		it('should return no costs when unit does not have requirements', async () => {
			const unit = {requirements: null} as UnitBlueprintGlobalModel;

			expect(
				await simpleUnitCalculationService.calculateResourcesCosts(
					{unitId: 'engineer', amount: 2} as AddUnitToQueueInput,
					unit,
				),
			).toEqual([]);
		});
	});
});
