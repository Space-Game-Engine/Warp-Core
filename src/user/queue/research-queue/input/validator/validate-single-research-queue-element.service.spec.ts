import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {ResearchNodeQueryEmitter} from '@warp-core/global/research-node';
import {
	QueueItemValidatorInterface,
	QueueValidationError,
} from '@warp-core/user/queue/core';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';
import {ValidateSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/input/validator/validate-single-research-queue-element.service';

jest.mock('@warp-core/database/repository/habitat-research-node.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock(
	'@warp-core/global/research-node/exchange/query/research-node-query.emitter',
);

describe('Validate single research queue element service', () => {
	let validateSingleResearchQueueElementService: ValidateSingleResearchQueueElementService;
	let researchNodeQueryEmitter: jest.Mocked<ResearchNodeQueryEmitter>;
	let habitatResearchNodeRepository: jest.Mocked<HabitatResearchNodeRepository>;
	let habitatModel: AuthorizedHabitatModel;

	const addToQueueInput = {
		researchNodeId: 'basic_research',
		endLevel: 1,
	} as AddResearchToQueueInput;
	const researchNode = {id: 'basic_research'} as ResearchNodeModel;
	const habitatResearchNode = {currentLevel: 0} as HabitatResearchNodeModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ValidateSingleResearchQueueElementService,
				ResearchNodeQueryEmitter,
				HabitatResearchNodeRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		validateSingleResearchQueueElementService = module.get(
			ValidateSingleResearchQueueElementService,
		);
		researchNodeQueryEmitter = module.get(ResearchNodeQueryEmitter);
		habitatResearchNodeRepository = module.get(HabitatResearchNodeRepository);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
	});

	function mockResearchNodeFound(): void {
		when(researchNodeQueryEmitter.getResearchNodeById)
			.expectCalledWith('basic_research')
			.mockResolvedValueOnce({data: researchNode, error: undefined});
		when(habitatResearchNodeRepository.getForHabitatAndResearchNode)
			.expectCalledWith(5, 'basic_research')
			.mockResolvedValueOnce(habitatResearchNode);
	}

	describe('validateQueueItem', () => {
		it('should throw validation error when research node does not exist', async () => {
			const validator = {validate: jest.fn()};
			when(researchNodeQueryEmitter.getResearchNodeById)
				.expectCalledWith('basic_research')
				.mockResolvedValueOnce({data: null, error: undefined});

			const result =
				validateSingleResearchQueueElementService.validateQueueItem({
					addToQueueInput,
					validators: [validator],
				});

			await expect(result).rejects.toBeInstanceOf(QueueValidationError);
			await expect(result).rejects.toMatchObject({
				validationError: {
					researchNodeId: ['Provided research node does not exist.'],
				},
			});
			expect(validator.validate).not.toHaveBeenCalled();
		});

		it('should run every validator with built validation context when research node exists', async () => {
			const firstValidator = {validate: jest.fn()};
			const secondValidator = {validate: jest.fn()};
			mockResearchNodeFound();

			await expect(
				validateSingleResearchQueueElementService.validateQueueItem({
					addToQueueInput,
					validators: [firstValidator, secondValidator],
				}),
			).resolves.toBe(true);

			const expectedContext = {
				addToQueueInput,
				researchNode,
				habitatResearchNode,
				validationError: expect.any(QueueValidationError),
			};
			expect(firstValidator.validate).toHaveBeenCalledWith(expectedContext);
			expect(secondValidator.validate).toHaveBeenCalledWith(expectedContext);
		});

		it('should throw validation error when any validator adds error', async () => {
			const failingValidator: QueueItemValidatorInterface<ResearchQueueInputValidation> =
				{
					validate: async ({validationError}): Promise<void> => {
						validationError.addError('endLevel', 'test error');
					},
				};
			mockResearchNodeFound();

			const result =
				validateSingleResearchQueueElementService.validateQueueItem({
					addToQueueInput,
					validators: [failingValidator],
				});

			await expect(result).rejects.toBeInstanceOf(QueueValidationError);
			await expect(result).rejects.toMatchObject({
				validationError: {endLevel: ['test error']},
			});
		});
	});
});
