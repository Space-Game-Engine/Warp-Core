import {Test, TestingModule} from '@nestjs/testing';

import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {
	QueueValidationError,
	ValidateQueueRequirementsService,
} from '@warp-core/user/queue/core';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {ResearchRequirementsValidator} from '@warp-core/user/queue/research-queue/input/validator/research-requirements.validator';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

jest.mock(
	'@warp-core/user/queue/core/input/validator/validate-queue-requirements.service',
);

describe('Research requirements validator', () => {
	let researchRequirementsValidator: ResearchRequirementsValidator;
	let validateQueueRequirementsService: jest.Mocked<ValidateQueueRequirementsService>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResearchRequirementsValidator,
				ValidateQueueRequirementsService,
			],
		}).compile();

		researchRequirementsValidator = module.get(ResearchRequirementsValidator);
		validateQueueRequirementsService = module.get(
			ValidateQueueRequirementsService,
		);
	});

	function prepareValidationInput(
		habitatResearchNode: HabitatResearchNodeModel | null,
	): ResearchQueueInputValidation {
		return {
			addToQueueInput: {endLevel: 2} as AddResearchToQueueInput,
			researchNode: {
				researchNodeDetailsAtCertainLevel: [
					{details: {level: 1}},
					{details: {level: 2}},
				],
			} as unknown as ResearchNodeModel,
			habitatResearchNode,
			validationError: new QueueValidationError(),
		};
	}

	describe('validate', () => {
		it('should validate requirements of research node levels between developed level and end level', async () => {
			const input = prepareValidationInput({
				currentLevel: 1,
			} as HabitatResearchNodeModel);

			await researchRequirementsValidator.validate(input);

			expect(validateQueueRequirementsService.validate).toHaveBeenCalledWith(
				[{level: 1}, {level: 2}],
				1,
				2,
				input.validationError,
			);
		});

		it('should validate requirements from level zero when research node is not developed in habitat', async () => {
			const input = prepareValidationInput(null);

			await researchRequirementsValidator.validate(input);

			expect(validateQueueRequirementsService.validate).toHaveBeenCalledWith(
				[{level: 1}, {level: 2}],
				0,
				2,
				input.validationError,
			);
		});
	});
});
