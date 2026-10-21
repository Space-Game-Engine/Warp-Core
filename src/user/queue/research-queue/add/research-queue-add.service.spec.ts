import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {PrepareSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/add/prepare-single-research-queue-element.service';
import {ResearchQueueAddService} from '@warp-core/user/queue/research-queue/add/research-queue-add.service';
import {ResearchQueueAddEmitter} from '@warp-core/user/queue/research-queue/exchange/emit/research-queue-add.emitter';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

jest.mock('@warp-core/database/repository/research-queue.repository');
jest.mock(
	'@warp-core/user/queue/research-queue/add/prepare-single-research-queue-element.service',
);
jest.mock(
	'@warp-core/user/queue/research-queue/exchange/emit/research-queue-add.emitter',
);

describe('Research queue add', () => {
	let researchQueueAddService: ResearchQueueAddService;
	let prepareResearchQueueElement: jest.Mocked<PrepareSingleResearchQueueElementService>;
	let researchQueueRepository: jest.Mocked<ResearchQueueRepository>;
	let researchQueueAddEmitter: jest.Mocked<ResearchQueueAddEmitter>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResearchQueueAddService,
				PrepareSingleResearchQueueElementService,
				ResearchQueueRepository,
				ResearchQueueAddEmitter,
			],
		}).compile();

		researchQueueAddService = module.get(ResearchQueueAddService);
		prepareResearchQueueElement = module.get(
			PrepareSingleResearchQueueElementService,
		);
		researchQueueRepository = module.get(ResearchQueueRepository);
		researchQueueAddEmitter = module.get(ResearchQueueAddEmitter);
	});

	describe('saveQueueElement', () => {
		const addToQueueInput = {
			researchNodeId: 'basic_research',
			endLevel: 1,
		} as AddResearchToQueueInput;

		it('should save queue element and commit transaction when nothing fails', async () => {
			const draftQueueElement = {id: null} as ResearchQueueElementModel;
			const savedQueueElement = {id: 1} as ResearchQueueElementModel;

			when(prepareResearchQueueElement.getQueueElement)
				.expectCalledWith(addToQueueInput)
				.mockResolvedValueOnce(draftQueueElement);
			when(researchQueueRepository.saveQueueElement)
				.expectCalledWith(draftQueueElement)
				.mockResolvedValueOnce(savedQueueElement);

			const result =
				await researchQueueAddService.saveQueueElement(addToQueueInput);

			expect(result).toBe(savedQueueElement);
			expect(researchQueueAddEmitter.beforeAddingElement).toHaveBeenCalledWith({
				queueElement: draftQueueElement,
			});
			expect(researchQueueAddEmitter.afterAddingElement).toHaveBeenCalledWith({
				queueElement: savedQueueElement,
			});
			expect(researchQueueRepository.startTransaction).toHaveBeenCalledTimes(1);
			expect(researchQueueRepository.commitTransaction).toHaveBeenCalledTimes(
				1,
			);
			expect(
				researchQueueRepository.rollbackTransaction,
			).not.toHaveBeenCalled();
		});

		it('should rollback transaction when after adding element listener throws error', async () => {
			const draftQueueElement = {id: null} as ResearchQueueElementModel;

			when(prepareResearchQueueElement.getQueueElement)
				.expectCalledWith(addToQueueInput)
				.mockResolvedValueOnce(draftQueueElement);
			researchQueueRepository.saveQueueElement.mockResolvedValueOnce({
				id: 1,
			} as ResearchQueueElementModel);
			researchQueueAddEmitter.afterAddingElement.mockRejectedValueOnce(
				new Error('something went wrong'),
			);

			await expect(
				researchQueueAddService.saveQueueElement(addToQueueInput),
			).rejects.toThrow('something went wrong');

			expect(researchQueueRepository.rollbackTransaction).toHaveBeenCalledTimes(
				1,
			);
			expect(researchQueueRepository.commitTransaction).not.toHaveBeenCalled();
		});

		it('should not start transaction when before adding element listener throws error', async () => {
			const draftQueueElement = {id: null} as ResearchQueueElementModel;

			when(prepareResearchQueueElement.getQueueElement)
				.expectCalledWith(addToQueueInput)
				.mockResolvedValueOnce(draftQueueElement);
			researchQueueAddEmitter.beforeAddingElement.mockRejectedValueOnce(
				new Error('not enough resources'),
			);

			await expect(
				researchQueueAddService.saveQueueElement(addToQueueInput),
			).rejects.toThrow('not enough resources');

			expect(researchQueueRepository.startTransaction).not.toHaveBeenCalled();
			expect(researchQueueRepository.saveQueueElement).not.toHaveBeenCalled();
		});
	});
});
