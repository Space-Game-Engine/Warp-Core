import {Test, TestingModule} from '@nestjs/testing';
import {DeepPartial} from 'typeorm';

import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {SimpleResearchCalculationService} from '@warp-core/user/queue/research-queue/add/calculate-resources/simple-research-calculation.service';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

describe('Simple calculation of resources for research queue element', () => {
	let simpleResearchCalculationService: SimpleResearchCalculationService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [SimpleResearchCalculationService],
		}).compile();

		simpleResearchCalculationService = module.get(
			SimpleResearchCalculationService,
		);
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
		queueCosts: DeepPartial<QueueElementCostModel>[];
	}[] = [
		{
			name: 'empty costs when research node has no level details',
			endLevel: 1,
			habitatResearchNode: null,
			researchNode: {researchNodeDetailsAtCertainLevel: []},
			queueCosts: [],
		},
		{
			name: 'costs of first level when habitat never researched node',
			endLevel: 1,
			habitatResearchNode: null,
			researchNode: {researchNodeDetailsAtCertainLevel: researchNodeDetails},
			queueCosts: [{resource: {id: 'wood'}, cost: 5}],
		},
		{
			name: 'summed costs of all levels when habitat never researched node and update is by multiple levels',
			endLevel: 3,
			habitatResearchNode: null,
			researchNode: {researchNodeDetailsAtCertainLevel: researchNodeDetails},
			queueCosts: [
				{resource: {id: 'wood'}, cost: 15},
				{resource: {id: 'coal'}, cost: 10},
			],
		},
		{
			name: 'costs only above current level when habitat already researched node',
			endLevel: 3,
			habitatResearchNode: {currentLevel: 2},
			researchNode: {researchNodeDetailsAtCertainLevel: researchNodeDetails},
			queueCosts: [{resource: {id: 'coal'}, cost: 7}],
		},
	];

	describe.each(testCases)('calculateResourcesCosts', singleTestCase => {
		it(`should return ${singleTestCase.name}`, async () => {
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
