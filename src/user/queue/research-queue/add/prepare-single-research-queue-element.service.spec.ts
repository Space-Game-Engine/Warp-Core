import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';
import {DeepPartial} from 'typeorm';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {ResearchNodeQueryEmitter} from '@warp-core/global/research-node';
import {QueueError} from '@warp-core/user/queue/core/exception/queue.error';
import {ResearchQueueResourceConsumerInterface} from '@warp-core/user/queue/research-queue/add/calculate-resources/research-queue-resource-consumer.interface';
import {PrepareSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/add/prepare-single-research-queue-element.service';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

jest.mock('@warp-core/database/repository/research-queue.repository');
jest.mock('@warp-core/database/repository/habitat-research-node.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock(
	'@warp-core/global/research-node/exchange/query/research-node-query.emitter',
);

describe('Prepare single research queue element', () => {
	let prepareResearchQueueElement: PrepareSingleResearchQueueElementService;
	let researchQueueRepository: jest.Mocked<ResearchQueueRepository>;
	let habitatResearchNodeRepository: jest.Mocked<HabitatResearchNodeRepository>;
	let researchNodeQueryEmitter: jest.Mocked<ResearchNodeQueryEmitter>;
	let habitatModel: AuthorizedHabitatModel;
	let resourcesCalculator: jest.Mocked<ResearchQueueResourceConsumerInterface>;

	const now = new Date('2026-01-01T10:00:00Z');
	const researchNode = {id: 'basic_research'} as ResearchNodeModel;
	const resourcesCosts = [
		{resource: {id: 'wood'}, cost: 5},
	] as QueueElementCostModel[];

	beforeEach(async () => {
		jest.clearAllMocks();
		jest.useFakeTimers().setSystemTime(now);

		resourcesCalculator = {
			calculateResourcesCosts: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PrepareSingleResearchQueueElementService,
				ResearchQueueRepository,
				HabitatResearchNodeRepository,
				ResearchNodeQueryEmitter,
				AuthorizedHabitatModel,
				{
					provide: ResearchQueueResourceConsumerInterface,
					useValue: resourcesCalculator,
				},
			],
		}).compile();

		prepareResearchQueueElement = module.get(
			PrepareSingleResearchQueueElementService,
		);
		researchQueueRepository = module.get(ResearchQueueRepository);
		habitatResearchNodeRepository = module.get(HabitatResearchNodeRepository);
		researchNodeQueryEmitter = module.get(ResearchNodeQueryEmitter);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
		(researchQueueRepository.create as jest.Mock).mockImplementation(
			(entity: DeepPartial<ResearchQueueElementModel>) =>
				Object.assign(new ResearchQueueElementModel(), entity),
		);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('getQueueElement', () => {
		const addToQueueInput = {
			researchNodeId: 'basic_research',
			endLevel: 3,
		} as AddResearchToQueueInput;

		function mockResearchNodeFound(): void {
			when(researchNodeQueryEmitter.getResearchNodeById)
				.expectCalledWith('basic_research')
				.mockResolvedValueOnce({data: researchNode, error: undefined});
		}

		it('should create draft starting from level 0 and now when habitat never researched node and queue is empty', async () => {
			mockResearchNodeFound();
			when(habitatResearchNodeRepository.getForHabitatAndResearchNode)
				.expectCalledWith(5, 'basic_research')
				.mockResolvedValueOnce(null);
			when(researchQueueRepository.getCurrentResearchQueueForResearchNode)
				.expectCalledWith('basic_research', 5)
				.mockResolvedValueOnce([]);
			when(resourcesCalculator.calculateResourcesCosts)
				.expectCalledWith(addToQueueInput, null, researchNode)
				.mockResolvedValueOnce(resourcesCosts);
			when(researchQueueRepository.getCurrentQueueForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce([]);
			when(researchNodeQueryEmitter.calculateTimeInSecondsToUpgradeResearchNode)
				.expectCalledWith({
					startLevel: 0,
					endLevel: 3,
					researchNodeId: 'basic_research',
				})
				.mockResolvedValueOnce({data: 100, error: undefined});

			const queueElement =
				await prepareResearchQueueElement.getQueueElement(addToQueueInput);

			expect(queueElement).toMatchObject({
				id: null,
				researchNode,
				researchNodeId: 'basic_research',
				habitatId: 5,
				startLevel: 0,
				endLevel: 3,
				isConsumed: false,
				costs: resourcesCosts,
			});
			expect(queueElement.startTime).toEqual(now);
			expect(queueElement.endTime).toEqual(
				new Date(now.getTime() + 100 * 1000),
			);
		});

		it('should start from current level and after last queue element when habitat already researched node and queue is not empty', async () => {
			const habitatResearchNode = {
				currentLevel: 2,
			} as HabitatResearchNodeModel;
			const lastQueueElementEndTime = new Date('2026-01-01T12:00:00Z');

			mockResearchNodeFound();
			when(habitatResearchNodeRepository.getForHabitatAndResearchNode)
				.expectCalledWith(5, 'basic_research')
				.mockResolvedValueOnce(habitatResearchNode);
			when(researchQueueRepository.getCurrentResearchQueueForResearchNode)
				.expectCalledWith('basic_research', 5)
				.mockResolvedValueOnce([]);
			when(resourcesCalculator.calculateResourcesCosts)
				.expectCalledWith(addToQueueInput, habitatResearchNode, researchNode)
				.mockResolvedValueOnce(resourcesCosts);
			when(researchQueueRepository.getCurrentQueueForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce([
					{endTime: new Date('2026-01-01T11:00:00Z')},
					{endTime: lastQueueElementEndTime},
				] as ResearchQueueElementModel[]);
			when(researchNodeQueryEmitter.calculateTimeInSecondsToUpgradeResearchNode)
				.expectCalledWith({
					startLevel: 2,
					endLevel: 3,
					researchNodeId: 'basic_research',
				})
				.mockResolvedValueOnce({data: 60, error: undefined});

			const queueElement =
				await prepareResearchQueueElement.getQueueElement(addToQueueInput);

			expect(queueElement.startLevel).toBe(2);
			expect(queueElement.startTime).toEqual(lastQueueElementEndTime);
			expect(queueElement.endTime).toEqual(
				new Date(lastQueueElementEndTime.getTime() + 60 * 1000),
			);
		});

		it('should start from end level of last queue element when research node is already queued', async () => {
			const habitatResearchNode = {
				currentLevel: 1,
			} as HabitatResearchNodeModel;

			mockResearchNodeFound();
			when(habitatResearchNodeRepository.getForHabitatAndResearchNode)
				.expectCalledWith(5, 'basic_research')
				.mockResolvedValueOnce(habitatResearchNode);
			when(researchQueueRepository.getCurrentResearchQueueForResearchNode)
				.expectCalledWith('basic_research', 5)
				.mockResolvedValueOnce([{endLevel: 2}] as ResearchQueueElementModel[]);
			when(resourcesCalculator.calculateResourcesCosts)
				.expectCalledWith(addToQueueInput, habitatResearchNode, researchNode)
				.mockResolvedValueOnce(resourcesCosts);
			when(researchQueueRepository.getCurrentQueueForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce([]);
			when(researchNodeQueryEmitter.calculateTimeInSecondsToUpgradeResearchNode)
				.expectCalledWith({
					startLevel: 2,
					endLevel: 3,
					researchNodeId: 'basic_research',
				})
				.mockResolvedValueOnce({data: 30, error: undefined});

			const queueElement =
				await prepareResearchQueueElement.getQueueElement(addToQueueInput);

			expect(queueElement.startLevel).toBe(2);
			expect(queueElement.costs).toEqual(resourcesCosts);
		});

		it('should throw queue error when research node does not exist', async () => {
			when(researchNodeQueryEmitter.getResearchNodeById)
				.expectCalledWith('basic_research')
				.mockResolvedValueOnce({data: null, error: undefined});

			await expect(
				prepareResearchQueueElement.getQueueElement(addToQueueInput),
			).rejects.toThrow(new QueueError('Failed to get research node'));
		});

		it('should throw internal emitter error when research node query fails', async () => {
			when(researchNodeQueryEmitter.getResearchNodeById)
				.expectCalledWith('basic_research')
				.mockResolvedValueOnce({
					data: undefined,
					error: {message: 'query failed', trace: undefined},
				});

			const result =
				prepareResearchQueueElement.getQueueElement(addToQueueInput);

			await expect(result).rejects.toBeInstanceOf(InternalEmitterError);
			await expect(result).rejects.toThrow('query failed');
		});

		it('should throw internal emitter error when upgrade time query fails', async () => {
			mockResearchNodeFound();
			habitatResearchNodeRepository.getForHabitatAndResearchNode.mockResolvedValueOnce(
				null,
			);
			researchQueueRepository.getCurrentResearchQueueForResearchNode.mockResolvedValueOnce(
				[],
			);
			resourcesCalculator.calculateResourcesCosts.mockResolvedValueOnce([]);
			researchQueueRepository.getCurrentQueueForHabitat.mockResolvedValueOnce(
				[],
			);
			researchNodeQueryEmitter.calculateTimeInSecondsToUpgradeResearchNode.mockResolvedValueOnce(
				{data: undefined, error: {message: 'time failed', trace: undefined}},
			);

			const result =
				prepareResearchQueueElement.getQueueElement(addToQueueInput);

			await expect(result).rejects.toBeInstanceOf(InternalEmitterError);
			await expect(result).rejects.toThrow('time failed');
		});
	});
});
