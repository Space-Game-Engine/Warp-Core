import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {UnitBlueprintPlayerModel} from '@warp-core/database/model/unit/unit-blueprint-player.model';
import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';
import {UnitInstanceRepository} from '@warp-core/database/repository/unit-instance.repository';
import {UnitBlueprintPlayerService} from '@warp-core/user/unit-instance/service/unit-blueprint-player.service';
import {UnitInstanceService} from '@warp-core/user/unit-instance/service/unit-instance.service';

jest.mock('@warp-core/database/repository/unit-instance.repository');
jest.mock(
	'@warp-core/user/unit-instance/service/unit-blueprint-player.service',
);
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Unit instance service', () => {
	let unitInstanceService: UnitInstanceService;
	let unitInstanceRepository: jest.Mocked<UnitInstanceRepository>;
	let unitBlueprintPlayerService: jest.Mocked<UnitBlueprintPlayerService>;
	let habitatModel: AuthorizedHabitatModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UnitInstanceService,
				UnitInstanceRepository,
				UnitBlueprintPlayerService,
				AuthorizedHabitatModel,
			],
		}).compile();

		unitInstanceService = module.get(UnitInstanceService);
		unitInstanceRepository = module.get(UnitInstanceRepository);
		unitBlueprintPlayerService = module.get(UnitBlueprintPlayerService);
		habitatModel = module.get(AuthorizedHabitatModel);
		habitatModel.id = 5;
	});

	describe('createUnitInstances', () => {
		it('should create separate instances from player blueprint of the unit', async () => {
			const savedInstances = [{id: 1}, {id: 2}] as UnitInstanceModel[];

			when(unitBlueprintPlayerService.getOrCreateForHabitat)
				.expectCalledWith(5, 'light_tank')
				.mockResolvedValueOnce({id: 9} as UnitBlueprintPlayerModel);
			unitInstanceRepository.create.mockImplementation(
				input => input as UnitInstanceModel,
			);
			unitInstanceRepository.save.mockResolvedValueOnce(
				savedInstances as never,
			);

			expect(
				await unitInstanceService.createUnitInstances(5, 'light_tank', 2),
			).toBe(savedInstances);
			expect(unitInstanceRepository.create).toHaveBeenCalledTimes(2);
			expect(unitInstanceRepository.save).toHaveBeenCalledWith([
				{habitatId: 5, unitBlueprintPlayerId: 9},
				{habitatId: 5, unitBlueprintPlayerId: 9},
			]);
		});
	});

	describe('getAllForCurrentHabitat', () => {
		it('should return unit instances of logged in habitat', async () => {
			const instances = [{id: 1}] as UnitInstanceModel[];

			when(unitInstanceRepository.getAllUnitInstancesForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce(instances);

			expect(await unitInstanceService.getAllForCurrentHabitat()).toBe(
				instances,
			);
		});
	});
});
