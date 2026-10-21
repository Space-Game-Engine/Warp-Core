import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {PrepareSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/add/prepare-single-research-queue-element.service';
import {ResearchQueueDraftService} from '@warp-core/user/queue/research-queue/add/research-queue-draft.service';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

jest.mock(
	'@warp-core/user/queue/research-queue/add/prepare-single-research-queue-element.service',
);

describe('Research queue draft', () => {
	let researchQueueDraftService: ResearchQueueDraftService;
	let prepareResearchQueueElement: jest.Mocked<PrepareSingleResearchQueueElementService>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResearchQueueDraftService,
				PrepareSingleResearchQueueElementService,
			],
		}).compile();

		researchQueueDraftService = module.get(ResearchQueueDraftService);
		prepareResearchQueueElement = module.get(
			PrepareSingleResearchQueueElementService,
		);
	});

	describe('getDraft', () => {
		it('should return prepared research queue element when input is provided', async () => {
			const addToQueueInput = {
				researchNodeId: 'basic_research',
				endLevel: 1,
			} as AddResearchToQueueInput;
			const preparedQueueElement = {id: null} as ResearchQueueElementModel;

			when(prepareResearchQueueElement.getQueueElement)
				.expectCalledWith(addToQueueInput)
				.mockResolvedValueOnce(preparedQueueElement);

			expect(await researchQueueDraftService.getDraft(addToQueueInput)).toBe(
				preparedQueueElement,
			);
		});
	});
});
