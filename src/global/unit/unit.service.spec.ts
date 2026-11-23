import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {UnitService} from './unit.service';

import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitBlueprintGlobalRepository} from '@warp-core/database/repository/unit-blueprint-global.repository';

jest.mock('@warp-core/database/repository/unit-blueprint-global.repository');

describe('Unit service', () => {
	let unitService: UnitService;
	let unitRepository: jest.Mocked<UnitBlueprintGlobalRepository>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [UnitService, UnitBlueprintGlobalRepository],
		}).compile();

		unitService = module.get(UnitService);
		unitRepository = module.get(UnitBlueprintGlobalRepository);
	});

	describe('getUnitById', () => {
		it('should return unit when unit with provided id exists', async () => {
			const unit = {id: 'light_tank'} as UnitBlueprintGlobalModel;

			when(unitRepository.getUnitById)
				.expectCalledWith('light_tank')
				.mockResolvedValueOnce(unit);

			expect(await unitService.getUnitById('light_tank')).toEqual(unit);
		});

		it('should return null when unit with provided id does not exist', async () => {
			when(unitRepository.getUnitById)
				.expectCalledWith('missing')
				.mockResolvedValueOnce(null);

			expect(await unitService.getUnitById('missing')).toBeNull();
		});
	});

	describe('getAllUnits', () => {
		it('should return all units', async () => {
			const units = [{id: 'a'}, {id: 'b'}] as UnitBlueprintGlobalModel[];

			when(unitRepository.getAllUnits)
				.expectCalledWith()
				.mockResolvedValueOnce(units);

			expect(await unitService.getAllUnits()).toEqual(units);
		});
	});
});
