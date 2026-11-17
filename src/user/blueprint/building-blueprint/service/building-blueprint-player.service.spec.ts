import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {BuildingBlueprintPlayerRepository} from '@warp-core/database/repository/building-blueprint-player.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {BuildingBlueprintPlayerService} from '@warp-core/user/blueprint/building-blueprint/service/building-blueprint-player.service';

jest.mock(
	'@warp-core/database/repository/building-blueprint-player.repository',
);
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Building blueprint player service', () => {
	let buildingBlueprintPlayerService: BuildingBlueprintPlayerService;
	let buildingBlueprintPlayerRepository: jest.Mocked<BuildingBlueprintPlayerRepository>;
	let habitatModel: AuthorizedHabitatModel;

	beforeAll(() => {
		prepareRepositoryMock(BuildingBlueprintPlayerRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingBlueprintPlayerService,
				BuildingBlueprintPlayerRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		buildingBlueprintPlayerService = module.get(BuildingBlueprintPlayerService);
		buildingBlueprintPlayerRepository = module.get(
			BuildingBlueprintPlayerRepository,
		);
		habitatModel = module.get(AuthorizedHabitatModel);
		habitatModel.id = 5;
	});

	describe('getOrCreateForHabitat', () => {
		it('should return existing player blueprint when habitat already has one', async () => {
			const existingBlueprint = {
				id: 3,
				habitatId: 5,
				buildingId: 'warehouse',
			} as BuildingBlueprintPlayerModel;

			when(buildingBlueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'warehouse')
				.mockResolvedValueOnce(existingBlueprint);

			expect(
				await buildingBlueprintPlayerService.getOrCreateForHabitat(
					5,
					'warehouse',
				),
			).toBe(existingBlueprint);
			expect(buildingBlueprintPlayerRepository.create).not.toHaveBeenCalled();
			expect(buildingBlueprintPlayerRepository.save).not.toHaveBeenCalled();
		});

		it('should create and save player blueprint with empty capabilities when habitat does not have one', async () => {
			const draft = {
				habitatId: 5,
				buildingId: 'warehouse',
			} as BuildingBlueprintPlayerModel;
			const savedBlueprint = {...draft, id: 9} as BuildingBlueprintPlayerModel;

			when(buildingBlueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'warehouse')
				.mockResolvedValueOnce(null);
			when(buildingBlueprintPlayerRepository.create)
				.expectCalledWith(
					expect.objectContaining({habitatId: 5, buildingId: 'warehouse'}),
				)
				.mockReturnValueOnce(draft);
			when(buildingBlueprintPlayerRepository.save)
				.expectCalledWith(draft)
				.mockResolvedValueOnce(savedBlueprint);

			expect(
				await buildingBlueprintPlayerService.getOrCreateForHabitat(
					5,
					'warehouse',
				),
			).toBe(savedBlueprint);

			const createInput = buildingBlueprintPlayerRepository.create.mock
				.calls[0][0] as BuildingBlueprintPlayerModel;
			expect(createInput.capabilities).toBeInstanceOf(CapabilitiesModel);
			expect(createInput.capabilities.production).toEqual([]);
			expect(createInput.capabilities.storage).toEqual([]);
		});
	});

	describe('getAllForCurrentHabitat', () => {
		it('should return player blueprints of logged in habitat', async () => {
			const blueprints = [{id: 1}, {id: 2}] as BuildingBlueprintPlayerModel[];

			when(buildingBlueprintPlayerRepository.getAllForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce(blueprints);

			expect(
				await buildingBlueprintPlayerService.getAllForCurrentHabitat(),
			).toBe(blueprints);
		});
	});

	describe('getForCurrentHabitatAndBuilding', () => {
		it('should return player blueprint of logged in habitat for provided building', async () => {
			const blueprint = {id: 1} as BuildingBlueprintPlayerModel;

			when(buildingBlueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'warehouse')
				.mockResolvedValueOnce(blueprint);

			expect(
				await buildingBlueprintPlayerService.getForCurrentHabitatAndBuilding(
					'warehouse',
				),
			).toBe(blueprint);
		});
	});
});
