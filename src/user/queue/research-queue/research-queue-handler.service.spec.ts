import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {ResearchQueueProcessingEmitter} from '@warp-core/user/queue/research-queue/exchange/emit/research-queue-processing.emitter';
import {ResearchQueueHandlerService} from '@warp-core/user/queue/research-queue/research-queue-handler.service';

jest.mock('@warp-core/database/repository/research-queue.repository');
jest.mock('@warp-core/database/repository/habitat-research-node.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock(
	'@warp-core/user/queue/research-queue/exchange/emit/research-queue-processing.emitter',
);

describe('Research queue handler service', () => {
	let researchQueueHandlerService: ResearchQueueHandlerService;
	let researchQueueRepository: jest.Mocked<ResearchQueueRepository>;
	let habitatResearchNodeRepository: jest.Mocked<HabitatResearchNodeRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;
	let eventEmitter: jest.Mocked<ResearchQueueProcessingEmitter>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResearchQueueHandlerService,
				ResearchQueueRepository,
				HabitatResearchNodeRepository,
				AuthorizedHabitatModel,
				ResearchQueueProcessingEmitter,
			],
		}).compile();

		researchQueueHandlerService = module.get(ResearchQueueHandlerService);
		researchQueueRepository = module.get(ResearchQueueRepository);
		habitatResearchNodeRepository = module.get(HabitatResearchNodeRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
		eventEmitter = module.get(ResearchQueueProcessingEmitter);

		authorizedHabitatModel.id = 1;
	});

	describe('getQueueItemsForHabitat', () => {
		it('should return current research queue for logged in habitat', async () => {
			const queueElements = [{id: 10}] as ResearchQueueElementModel[];

			when(researchQueueRepository.getCurrentQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce(queueElements);

			expect(await researchQueueHandlerService.getQueueItemsForHabitat()).toBe(
				queueElements,
			);
		});
	});

	describe('resolveQueue', () => {
		it('should not process anything when there are no unresolved queue elements', async () => {
			when(researchQueueRepository.getUnresolvedQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce([]);

			await researchQueueHandlerService.resolveQueue();

			expect(eventEmitter.beforeProcessing).not.toHaveBeenCalled();
			expect(eventEmitter.afterProcessing).not.toHaveBeenCalled();
			expect(
				researchQueueRepository.markElementAsConsumed,
			).not.toHaveBeenCalled();
			expect(habitatResearchNodeRepository.update).not.toHaveBeenCalled();
			expect(habitatResearchNodeRepository.save).not.toHaveBeenCalled();
		});

		it('should update existing habitat research node when habitat already researched that node', async () => {
			const endTime = new Date('2026-01-01T10:00:00Z');
			const queueElement = {
				id: 10,
				habitatId: 1,
				researchNodeId: 'basic_research',
				endLevel: 3,
				endTime,
				isConsumed: false,
			} as ResearchQueueElementModel;

			when(researchQueueRepository.getUnresolvedQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce([queueElement]);
			when(habitatResearchNodeRepository.getForHabitatAndResearchNode)
				.expectCalledWith(1, 'basic_research')
				.mockResolvedValueOnce({id: 'hrn-1'} as HabitatResearchNodeModel);

			await researchQueueHandlerService.resolveQueue();

			expect(habitatResearchNodeRepository.update).toHaveBeenCalledWith(
				'hrn-1',
				{currentLevel: 3, lastCalculationTime: endTime},
			);
			expect(habitatResearchNodeRepository.save).not.toHaveBeenCalled();
			expect(queueElement.isConsumed).toBe(true);
			expect(
				researchQueueRepository.markElementAsConsumed,
			).toHaveBeenCalledWith(queueElement);
			expect(eventEmitter.beforeProcessing).toHaveBeenCalledWith({
				queueElement,
			});
			expect(eventEmitter.afterProcessing).toHaveBeenCalledWith({
				queueElement,
			});
		});

		it('should create habitat research node when habitat never researched that node', async () => {
			const endTime = new Date('2026-01-01T10:00:00Z');
			const queueElement = {
				id: 10,
				habitatId: 1,
				researchNodeId: 'basic_research',
				endLevel: 1,
				endTime,
				isConsumed: false,
			} as ResearchQueueElementModel;
			const newHabitatResearchNode = {
				researchNodeId: 'basic_research',
			} as HabitatResearchNodeModel;

			when(researchQueueRepository.getUnresolvedQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce([queueElement]);
			when(habitatResearchNodeRepository.getForHabitatAndResearchNode)
				.expectCalledWith(1, 'basic_research')
				.mockResolvedValueOnce(null);
			when(habitatResearchNodeRepository.create as jest.Mock)
				.expectCalledWith({
					habitatId: 1,
					researchNodeId: 'basic_research',
					currentLevel: 1,
					lastCalculationTime: endTime,
				})
				.mockReturnValueOnce(newHabitatResearchNode);

			await researchQueueHandlerService.resolveQueue();

			expect(habitatResearchNodeRepository.save).toHaveBeenCalledWith(
				newHabitatResearchNode,
			);
			expect(habitatResearchNodeRepository.update).not.toHaveBeenCalled();
			expect(
				researchQueueRepository.markElementAsConsumed,
			).toHaveBeenCalledWith(queueElement);
		});

		it('should process every unresolved queue element in order when there are multiple elements', async () => {
			const queueElements = [
				{id: 10, habitatId: 1, researchNodeId: 'a', endLevel: 1},
				{id: 11, habitatId: 1, researchNodeId: 'b', endLevel: 2},
			] as ResearchQueueElementModel[];

			when(researchQueueRepository.getUnresolvedQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce(queueElements);
			habitatResearchNodeRepository.getForHabitatAndResearchNode.mockResolvedValue(
				{id: 'hrn'} as HabitatResearchNodeModel,
			);

			await researchQueueHandlerService.resolveQueue();

			expect(
				researchQueueRepository.markElementAsConsumed,
			).toHaveBeenCalledTimes(2);
			expect(
				researchQueueRepository.markElementAsConsumed,
			).toHaveBeenNthCalledWith(1, queueElements[0]);
			expect(
				researchQueueRepository.markElementAsConsumed,
			).toHaveBeenNthCalledWith(2, queueElements[1]);
			expect(eventEmitter.afterProcessing).toHaveBeenCalledTimes(2);
		});
	});
});
