import {Test, TestingModule} from '@nestjs/testing';

import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchNodeInstallService} from '@warp-core/global/research-node/install/research-node-install.service';

describe('Research node install service', () => {
	let researchNodeInstallService: ResearchNodeInstallService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [ResearchNodeInstallService],
		}).compile();

		researchNodeInstallService = module.get(ResearchNodeInstallService);
	});

	describe('loadModels', () => {
		it('should return empty array when research nodes key does not exist in config', () => {
			expect(researchNodeInstallService.loadModels({})).toEqual([]);
		});

		it('should throw error when installation object contains errors', () => {
			const researchNode = {
				id: 'wrong_research',
				name: 'W',
				researchNodeDetailsAtCertainLevel: [],
			} as unknown as ResearchNodeModel;

			expect(() =>
				researchNodeInstallService.loadModels({
					researchNodes: [researchNode],
				}),
			).toThrow('Validation error, see logs');
		});

		it('should add items from array to install', () => {
			const researchNode = {
				id: 'basic_research',
				name: 'Basic research',
				researchNodeDetailsAtCertainLevel: [
					{details: {level: 1, timeToUpdateInSeconds: 10}},
				],
			} as unknown as ResearchNodeModel;

			const models = researchNodeInstallService.loadModels({
				researchNodes: [researchNode],
			});

			expect(models).toHaveLength(1);
			expect(models.pop()).toBeInstanceOf(ResearchNodeModel);
		});
	});
});
