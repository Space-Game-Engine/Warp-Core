import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';
import {DeepPartial} from 'typeorm';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {SimpleResearchCalculationService} from '@warp-core/user/queue/research-queue/add/calculate-resources/simple-research-calculation.service';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

jest.mock('@warp-core/database/repository/research-queue.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Simple calculation of resources for research queue element', () => {
	let simpleResearchCalculationService: SimpleResearchCalculationService;
	let researchQueueRepository: jest.Mocked<ResearchQueueRepository>;
	let habitatModel: AuthorizedHabitatModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SimpleResearchCalculationService,
				ResearchQueueRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		simpleResearchCalculationService = module.get(
			SimpleResearchCalculationService,
		);
		researchQueueRepository = module.get(ResearchQueueRepository);
		habitatModel = module.get(AuthorizedHabitatModel);
	});

	const researchNodeDetails = [
		{details: {level: 1, requirements: [{resource: {id: 'wood'}, cost: 5}]}},
		{
			details: {
				level: 2,
				requirements: [
					{resource: {id: 'wood'}, cost: 10},
					{resource: {id: 'coal'}, cost: 3},
				],
			},
		},
		{details: {level: 3, requirements: [{resource: {id: 'coal'}, cost: 7}]}},
	];

	const testCases: {
		name: string;
		endLevel: number;
		habitatResearchNode: Partial<HabitatResearchNodeModel> | null;
		researchNode: DeepPartial<ResearchNodeModel>;
		existingResearchNodeQueue?: Partial<ResearchQueueElementModel>[];
		queueCosts: DeepPartial<QueueElementCostModel>[];
	}[] = [
		{
			name: 'empty costs when research node has no level details',
			endLevel: 1,
			habitatResearchNode: null,
			researchNode: {
				id: 'basic_research',
				researchNodeDetailsAtCertainLevel: [],
			},
			queueCosts: [],
		},
		{
			name: 'costs of first level when habitat never researched node',
			endLevel: 1,
			habitatResearchNode: null,
			researchNode: {
				id: 'basic_research',
				researchNodeDetailsAtCertainLevel: researchNodeDetails,
			},
			queueCosts: [{resource: {id: 'wood'}, cost: 5}],
		},
		{
			name: 'summed costs of all levels when habitat never researched node and update is by multiple levels',
			endLevel: 3,
			habitatResearchNode: null,
			researchNode: {
				id: 'basic_research',
				researchNodeDetailsAtCertainLevel: researchNodeDetails,
			},
			queueCosts: [
				{resource: {id: 'wood'}, cost: 15},
				{resource: {id: 'coal'}, cost: 10},
			],
		},
		{
			name: 'costs only above current level when habitat already researched node',
			endLevel: 3,
			habitatResearchNode: {currentLevel: 2},
			researchNode: {
				id: 'basic_research',
				researchNodeDetailsAtCertainLevel: researchNodeDetails,
			},
			queueCosts: [{resource: {id: 'coal'}, cost: 7}],
		},
		{
			name: 'costs only above end level of last queue element when research node is already in queue',
			endLevel: 3,
			habitatResearchNode: {currentLevel: 1},
			researchNode: {
				id: 'basic_research',
				researchNodeDetailsAtCertainLevel: researchNodeDetails,
			},
			existingResearchNodeQueue: [{endLevel: 2}],
			queueCosts: [{resource: {id: 'coal'}, cost: 7}],
		},
	];

	describe.each(testCases)('calculateResourcesCosts', singleTestCase => {
		it(`should return ${singleTestCase.name}`, async () => {
			habitatModel.id = 5;
			when(researchQueueRepository.getCurrentResearchQueueForResearchNode)
				.expectCalledWith('basic_research', 5)
				.mockResolvedValueOnce(
					(singleTestCase.existingResearchNodeQueue ??
						[]) as ResearchQueueElementModel[],
				);

			const queueCosts =
				await simpleResearchCalculationService.calculateResourcesCosts(
					{endLevel: singleTestCase.endLevel} as AddResearchToQueueInput,
					singleTestCase.habitatResearchNode as HabitatResearchNodeModel | null,
					singleTestCase.researchNode as ResearchNodeModel,
				);

			expect(queueCosts).toEqual(singleTestCase.queueCosts);
		});
	});
});
