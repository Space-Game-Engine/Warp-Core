import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {BuildingBlueprintPlayerRepository} from '@warp-core/database/repository/building-blueprint-player.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {BuildingBlueprintPlayerService} from '@warp-core/user/blueprint/building-blueprint/service/building-blueprint-player.service';

jest.mock(
	'@warp-core/database/repository/building-blueprint-player.repository',
);
jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Building blueprint player service', () => {
	let buildingBlueprintPlayerService: BuildingBlueprintPlayerService;
	let buildingBlueprintPlayerRepository: jest.Mocked<BuildingBlueprintPlayerRepository>;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
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
				BuildingZoneRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		buildingBlueprintPlayerService = module.get(BuildingBlueprintPlayerService);
		buildingBlueprintPlayerRepository = module.get(
			BuildingBlueprintPlayerRepository,
		);
		buildingZoneRepository = module.get(BuildingZoneRepository);
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

	describe('assignToBuildingZone', () => {
		it('should create player blueprint and save zone when zone does not have blueprint', async () => {
			const buildingZone = {
				id: 1,
				habitatId: 5,
				level: 0,
				buildingBlueprintPlayerId: null,
			} as unknown as BuildingZoneModel;

			when(buildingBlueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'warehouse')
				.mockResolvedValueOnce({
					id: 9,
				} as BuildingBlueprintPlayerModel);

			await buildingBlueprintPlayerService.assignToBuildingZone(
				buildingZone,
				'warehouse',
				2,
			);

			expect(buildingZone.buildingBlueprintPlayerId).toBe(9);
			expect(buildingZone.level).toBe(2);
			expect(buildingZoneRepository.update).toHaveBeenCalledWith(1, {
				buildingBlueprintPlayerId: 9,
				level: 2,
			});
		});

		it('should only update level when zone already has blueprint', async () => {
			const buildingZone = {
				id: 1,
				habitatId: 5,
				level: 1,
				buildingBlueprintPlayerId: 7,
			} as BuildingZoneModel;

			await buildingBlueprintPlayerService.assignToBuildingZone(
				buildingZone,
				'warehouse',
				2,
			);

			expect(
				buildingBlueprintPlayerRepository.getForHabitatAndGlobalBlueprint,
			).not.toHaveBeenCalled();
			expect(buildingZoneRepository.update).toHaveBeenCalledWith(1, {
				buildingBlueprintPlayerId: 7,
				level: 2,
			});
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
