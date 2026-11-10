import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {ValidateResearchNodeRequirementsService} from '@warp-core/user/queue/core/input/validator/validate-research-node-requirements.service';

jest.mock('@warp-core/database/repository/habitat-research-node.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Validate research node requirements service', () => {
	let validateResearchNodeRequirementsService: ValidateResearchNodeRequirementsService;
	let habitatResearchNodeRepository: jest.Mocked<HabitatResearchNodeRepository>;
	let habitatModel: AuthorizedHabitatModel;
	let validationError: QueueValidationError;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ValidateResearchNodeRequirementsService,
				HabitatResearchNodeRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		validateResearchNodeRequirementsService = module.get(
			ValidateResearchNodeRequirementsService,
		);
		habitatResearchNodeRepository = module.get(HabitatResearchNodeRepository);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
		validationError = new QueueValidationError();
	});

	describe('validate', () => {
		it('should not query developed research nodes when there are no research node requirements', async () => {
			await validateResearchNodeRequirementsService.validate(
				[
					{resourceId: 'wood', cost: 1},
					{buildingId: 'university', buildingLevel: 1},
				] as RequirementsPerLevelModel[],
				validationError,
			);

			expect(validationError.hasErrors()).toBe(false);
			expect(
				habitatResearchNodeRepository.getForHabitatAndResearchNodes,
			).not.toHaveBeenCalled();
		});

		it('should add error when required research node is not developed', async () => {
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy'])
				.mockResolvedValueOnce([]);

			await validateResearchNodeRequirementsService.validate(
				[
					{researchNodeId: 'metallurgy', researchNodeLevel: 1},
				] as RequirementsPerLevelModel[],
				validationError,
			);

			expect(validationError.getResponse()).toEqual({
				requirements: ['Research node metallurgy at level 1 is required.'],
			});
		});

		it('should not add error when required research node is developed to required level', async () => {
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy'])
				.mockResolvedValueOnce([
					{researchNodeId: 'metallurgy', currentLevel: 1},
				] as HabitatResearchNodeModel[]);

			await validateResearchNodeRequirementsService.validate(
				[
					{researchNodeId: 'metallurgy', researchNodeLevel: 1},
				] as RequirementsPerLevelModel[],
				validationError,
			);

			expect(validationError.hasErrors()).toBe(false);
		});

		it('should use highest required level and report every missing research node when there are multiple requirements', async () => {
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy', 'chemistry'])
				.mockResolvedValueOnce([
					{researchNodeId: 'metallurgy', currentLevel: 2},
				] as HabitatResearchNodeModel[]);

			await validateResearchNodeRequirementsService.validate(
				[
					{researchNodeId: 'metallurgy', researchNodeLevel: 1},
					{researchNodeId: 'metallurgy', researchNodeLevel: 3},
					{researchNodeId: 'chemistry', researchNodeLevel: 1},
				] as RequirementsPerLevelModel[],
				validationError,
			);

			expect(validationError.getResponse()).toEqual({
				requirements: [
					'Research node metallurgy at level 3 is required.',
					'Research node chemistry at level 1 is required.',
				],
			});
		});
	});
});
