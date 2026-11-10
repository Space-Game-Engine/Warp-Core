import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {ValidateBuildingRequirementsService} from '@warp-core/user/queue/core/input/validator/validate-building-requirements.service';

jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Validate building requirements service', () => {
	let validateBuildingRequirementsService: ValidateBuildingRequirementsService;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let habitatModel: AuthorizedHabitatModel;
	let validationError: QueueValidationError;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ValidateBuildingRequirementsService,
				BuildingZoneRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		validateBuildingRequirementsService = module.get(
			ValidateBuildingRequirementsService,
		);
		buildingZoneRepository = module.get(BuildingZoneRepository);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
		validationError = new QueueValidationError();
	});

	describe('validate', () => {
		it('should not query building zones when there are no building requirements', async () => {
			await validateBuildingRequirementsService.validate(
				[
					{resourceId: 'wood', cost: 1},
					{researchNodeId: 'metallurgy', researchNodeLevel: 1},
				] as RequirementsPerLevelModel[],
				validationError,
			);

			expect(validationError.hasErrors()).toBe(false);
			expect(
				buildingZoneRepository.getBuildingZonesForHabitatAndBuildings,
			).not.toHaveBeenCalled();
		});

		it('should add error when required building is not built', async () => {
			when(buildingZoneRepository.getBuildingZonesForHabitatAndBuildings)
				.expectCalledWith(5, ['university'])
				.mockResolvedValueOnce([]);

			await validateBuildingRequirementsService.validate(
				[
					{buildingId: 'university', buildingLevel: 1},
				] as RequirementsPerLevelModel[],
				validationError,
			);

			expect(validationError.getResponse()).toEqual({
				requirements: ['Building university at level 1 is required.'],
			});
		});

		it('should not add error when required building is built to required level', async () => {
			when(buildingZoneRepository.getBuildingZonesForHabitatAndBuildings)
				.expectCalledWith(5, ['university'])
				.mockResolvedValueOnce([
					{buildingId: 'university', level: 1},
				] as BuildingZoneModel[]);

			await validateBuildingRequirementsService.validate(
				[
					{buildingId: 'university', buildingLevel: 1},
				] as RequirementsPerLevelModel[],
				validationError,
			);

			expect(validationError.hasErrors()).toBe(false);
		});

		it('should use highest built level and report every missing building when there are multiple requirements', async () => {
			when(buildingZoneRepository.getBuildingZonesForHabitatAndBuildings)
				.expectCalledWith(5, ['university', 'coal_mine'])
				.mockResolvedValueOnce([
					{buildingId: 'university', level: 1},
					{buildingId: 'university', level: 3},
					{buildingId: 'coal_mine', level: 1},
				] as BuildingZoneModel[]);

			await validateBuildingRequirementsService.validate(
				[
					{buildingId: 'university', buildingLevel: 1},
					{buildingId: 'university', buildingLevel: 3},
					{buildingId: 'coal_mine', buildingLevel: 2},
				] as RequirementsPerLevelModel[],
				validationError,
			);

			expect(validationError.getResponse()).toEqual({
				requirements: ['Building coal_mine at level 2 is required.'],
			});
		});
	});
});
