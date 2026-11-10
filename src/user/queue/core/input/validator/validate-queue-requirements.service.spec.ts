import {Test, TestingModule} from '@nestjs/testing';

import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {ValidateBuildingRequirementsService} from '@warp-core/user/queue/core/input/validator/validate-building-requirements.service';
import {ValidateQueueRequirementsService} from '@warp-core/user/queue/core/input/validator/validate-queue-requirements.service';
import {ValidateResearchNodeRequirementsService} from '@warp-core/user/queue/core/input/validator/validate-research-node-requirements.service';

jest.mock(
	'@warp-core/user/queue/core/input/validator/validate-research-node-requirements.service',
);
jest.mock(
	'@warp-core/user/queue/core/input/validator/validate-building-requirements.service',
);

describe('Validate queue requirements service', () => {
	let validateQueueRequirementsService: ValidateQueueRequirementsService;
	let validateResearchNodeRequirementsService: jest.Mocked<ValidateResearchNodeRequirementsService>;
	let validateBuildingRequirementsService: jest.Mocked<ValidateBuildingRequirementsService>;
	let validationError: QueueValidationError;

	const levelDetails = [
		{
			level: 1,
			requirements: [{researchNodeId: 'metallurgy', researchNodeLevel: 1}],
		},
		{
			level: 2,
			requirements: [{buildingId: 'university', buildingLevel: 1}],
		},
		{
			level: 3,
			requirements: [{researchNodeId: 'chemistry', researchNodeLevel: 1}],
		},
	] as unknown as DetailsAtCertainLevelModel[];

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ValidateQueueRequirementsService,
				ValidateResearchNodeRequirementsService,
				ValidateBuildingRequirementsService,
			],
		}).compile();

		validateQueueRequirementsService = module.get(
			ValidateQueueRequirementsService,
		);
		validateResearchNodeRequirementsService = module.get(
			ValidateResearchNodeRequirementsService,
		);
		validateBuildingRequirementsService = module.get(
			ValidateBuildingRequirementsService,
		);

		validationError = new QueueValidationError();
	});

	describe('validate', () => {
		it('should pass requirements of levels from start level (exclusive) to end level (inclusive) to both validators', async () => {
			await validateQueueRequirementsService.validate(
				levelDetails,
				1,
				2,
				validationError,
			);

			const expectedRequirements = [
				{buildingId: 'university', buildingLevel: 1},
			];
			expect(
				validateResearchNodeRequirementsService.validate,
			).toHaveBeenCalledWith(expectedRequirements, validationError);
			expect(validateBuildingRequirementsService.validate).toHaveBeenCalledWith(
				expectedRequirements,
				validationError,
			);
		});

		it('should pass empty requirements to both validators when no level is upgraded', async () => {
			await validateQueueRequirementsService.validate(
				levelDetails,
				3,
				3,
				validationError,
			);

			expect(
				validateResearchNodeRequirementsService.validate,
			).toHaveBeenCalledWith([], validationError);
			expect(validateBuildingRequirementsService.validate).toHaveBeenCalledWith(
				[],
				validationError,
			);
		});
	});
});
