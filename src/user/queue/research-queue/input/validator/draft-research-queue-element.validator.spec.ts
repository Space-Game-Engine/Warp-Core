import {ArgumentMetadata, BadRequestException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';

import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {DraftResearchQueueElementValidator} from '@warp-core/user/queue/research-queue/input/validator/draft-research-queue-element.validator';
import {ResearchConfigurationValidator} from '@warp-core/user/queue/research-queue/input/validator/research-configuration.validator';
import {ResearchEndLevelValidator} from '@warp-core/user/queue/research-queue/input/validator/research-end-level.validator';
import {ResearchPrerequisitesValidator} from '@warp-core/user/queue/research-queue/input/validator/research-prerequisites.validator';
import {ValidateSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/input/validator/validate-single-research-queue-element.service';

jest.mock(
	'@warp-core/user/queue/research-queue/input/validator/validate-single-research-queue-element.service',
);
jest.mock(
	'@warp-core/user/queue/research-queue/input/validator/research-configuration.validator',
);
jest.mock(
	'@warp-core/user/queue/research-queue/input/validator/research-end-level.validator',
);
jest.mock(
	'@warp-core/user/queue/research-queue/input/validator/research-prerequisites.validator',
);

describe('Draft research queue element validator', () => {
	let draftResearchQueueElementValidator: DraftResearchQueueElementValidator;
	let validateQueueItem: jest.Mocked<ValidateSingleResearchQueueElementService>;
	let configurationValidator: ResearchConfigurationValidator;
	let endLevelValidator: ResearchEndLevelValidator;
	let prerequisitesValidator: ResearchPrerequisitesValidator;

	const metadata = {
		type: 'body',
		metatype: AddResearchToQueueInput,
	} as ArgumentMetadata;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DraftResearchQueueElementValidator,
				ValidateSingleResearchQueueElementService,
				ResearchConfigurationValidator,
				ResearchEndLevelValidator,
				ResearchPrerequisitesValidator,
			],
		}).compile();

		draftResearchQueueElementValidator = module.get(
			DraftResearchQueueElementValidator,
		);
		validateQueueItem = module.get(ValidateSingleResearchQueueElementService);
		configurationValidator = module.get(ResearchConfigurationValidator);
		endLevelValidator = module.get(ResearchEndLevelValidator);
		prerequisitesValidator = module.get(ResearchPrerequisitesValidator);
	});

	describe('transform', () => {
		it('should validate queue item with configuration, end level and prerequisites validators when input is valid', async () => {
			const input = {researchNodeId: 'basic_research', endLevel: 1};
			validateQueueItem.validateQueueItem.mockResolvedValueOnce(true);

			expect(
				await draftResearchQueueElementValidator.transform(input, metadata),
			).toBe(input);
			expect(validateQueueItem.validateQueueItem).toHaveBeenCalledWith({
				addToQueueInput: expect.objectContaining(input),
				validators: [
					configurationValidator,
					endLevelValidator,
					prerequisitesValidator,
				],
			});
		});

		it('should throw bad request exception and skip queue validation when input is invalid', async () => {
			const input = {researchNodeId: 'basic_research', endLevel: 0};

			await expect(
				draftResearchQueueElementValidator.transform(input, metadata),
			).rejects.toThrow(BadRequestException);
			expect(validateQueueItem.validateQueueItem).not.toHaveBeenCalled();
		});
	});
});
