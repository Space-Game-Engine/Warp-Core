import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {UnitBlueprintPlayerModel} from '@warp-core/database/model/unit/unit-blueprint-player.model';
import {UnitBlueprintPlayerRepository} from '@warp-core/database/repository/unit-blueprint-player.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {UnitBlueprintPlayerService} from '@warp-core/user/unit-instance/service/unit-blueprint-player.service';

jest.mock('@warp-core/database/repository/unit-blueprint-player.repository');

describe('Unit blueprint player service', () => {
	let unitBlueprintPlayerService: UnitBlueprintPlayerService;
	let unitBlueprintPlayerRepository: jest.Mocked<UnitBlueprintPlayerRepository>;

	beforeAll(() => {
		prepareRepositoryMock(UnitBlueprintPlayerRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [UnitBlueprintPlayerService, UnitBlueprintPlayerRepository],
		}).compile();

		unitBlueprintPlayerService = module.get(UnitBlueprintPlayerService);
		unitBlueprintPlayerRepository = module.get(UnitBlueprintPlayerRepository);
	});

	describe('getOrCreateForHabitat', () => {
		it('should return existing player blueprint when habitat already has one', async () => {
			const existingBlueprint = {id: 3} as UnitBlueprintPlayerModel;

			when(unitBlueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'light_tank')
				.mockResolvedValueOnce(existingBlueprint);

			expect(
				await unitBlueprintPlayerService.getOrCreateForHabitat(5, 'light_tank'),
			).toBe(existingBlueprint);
			expect(unitBlueprintPlayerRepository.save).not.toHaveBeenCalled();
		});

		it('should create and save player blueprint with empty capabilities when habitat does not have one', async () => {
			const draft = {
				habitatId: 5,
				unitId: 'light_tank',
			} as UnitBlueprintPlayerModel;
			const savedBlueprint = {...draft, id: 9} as UnitBlueprintPlayerModel;

			when(unitBlueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'light_tank')
				.mockResolvedValueOnce(null);
			when(unitBlueprintPlayerRepository.create)
				.expectCalledWith(
					expect.objectContaining({habitatId: 5, unitId: 'light_tank'}),
				)
				.mockReturnValueOnce(draft);
			when(unitBlueprintPlayerRepository.save)
				.expectCalledWith(draft)
				.mockResolvedValueOnce(savedBlueprint);

			expect(
				await unitBlueprintPlayerService.getOrCreateForHabitat(5, 'light_tank'),
			).toBe(savedBlueprint);

			const createInput = unitBlueprintPlayerRepository.create.mock
				.calls[0][0] as UnitBlueprintPlayerModel;
			expect(createInput.capabilities).toBeInstanceOf(CapabilitiesModel);
			expect(createInput.capabilities.production).toEqual([]);
			expect(createInput.capabilities.storage).toEqual([]);
		});
	});
});
