import {ArgumentMetadata, BadRequestException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';

import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {AddResearchToQueueValidator} from '@warp-core/user/queue/research-queue/input/validator/add-research-to-queue.validator';
import {ResearchConfigurationValidator} from '@warp-core/user/queue/research-queue/input/validator/research-configuration.validator';
import {ResearchEndLevelValidator} from '@warp-core/user/queue/research-queue/input/validator/research-end-level.validator';
import {ResearchMaxQueueCountValidator} from '@warp-core/user/queue/research-queue/input/validator/research-max-queue-count.validator';
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
	'@warp-core/user/queue/research-queue/input/validator/research-max-queue-count.validator',
);
jest.mock(
	'@warp-core/user/queue/research-queue/input/validator/research-prerequisites.validator',
);

describe('Add research to queue validator', () => {
	let addResearchToQueueValidator: AddResearchToQueueValidator;
	let validateQueueItem: jest.Mocked<ValidateSingleResearchQueueElementService>;
	let configurationValidator: ResearchConfigurationValidator;
	let endLevelValidator: ResearchEndLevelValidator;
	let maxQueueCountValidator: ResearchMaxQueueCountValidator;
	let prerequisitesValidator: ResearchPrerequisitesValidator;

	const metadata = {
		type: 'body',
		metatype: AddResearchToQueueInput,
	} as ArgumentMetadata;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AddResearchToQueueValidator,
				ValidateSingleResearchQueueElementService,
				ResearchConfigurationValidator,
				ResearchEndLevelValidator,
				ResearchMaxQueueCountValidator,
				ResearchPrerequisitesValidator,
			],
		}).compile();

		addResearchToQueueValidator = module.get(AddResearchToQueueValidator);
		validateQueueItem = module.get(ValidateSingleResearchQueueElementService);
		configurationValidator = module.get(ResearchConfigurationValidator);
		endLevelValidator = module.get(ResearchEndLevelValidator);
		maxQueueCountValidator = module.get(ResearchMaxQueueCountValidator);
		prerequisitesValidator = module.get(ResearchPrerequisitesValidator);
	});

	describe('transform', () => {
		it('should validate queue item with configuration, end level, max queue count and prerequisites validators when input is valid', async () => {
			const input = {researchNodeId: 'basic_research', endLevel: 1};
			validateQueueItem.validateQueueItem.mockResolvedValueOnce(true);

			expect(await addResearchToQueueValidator.transform(input, metadata)).toBe(
				input,
			);
			expect(validateQueueItem.validateQueueItem).toHaveBeenCalledWith({
				addToQueueInput: expect.objectContaining(input),
				validators: [
					configurationValidator,
					endLevelValidator,
					maxQueueCountValidator,
					prerequisitesValidator,
				],
			});
		});

		it('should throw bad request exception and skip queue validation when input is invalid', async () => {
			const input = {researchNodeId: 'basic_research', endLevel: -1};

			await expect(
				addResearchToQueueValidator.transform(input, metadata),
			).rejects.toThrow(BadRequestException);
			expect(validateQueueItem.validateQueueItem).not.toHaveBeenCalled();
		});

		it('should rethrow error when queue validation fails', async () => {
			const input = {researchNodeId: 'basic_research', endLevel: 1};
			validateQueueItem.validateQueueItem.mockRejectedValueOnce(
				new Error('queue validation failed'),
			);

			await expect(
				addResearchToQueueValidator.transform(input, metadata),
			).rejects.toThrow('queue validation failed');
		});
	});
});
