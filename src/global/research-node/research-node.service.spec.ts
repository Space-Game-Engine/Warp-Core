import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchNodeRepository} from '@warp-core/database/repository/research-node.repository';
import {ResearchNodeService} from '@warp-core/global/research-node/research-node.service';

jest.mock('@warp-core/database/repository/research-node.repository');

describe('Research node service', () => {
	let researchNodeService: ResearchNodeService;
	let researchNodeRepository: jest.Mocked<ResearchNodeRepository>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [ResearchNodeService, ResearchNodeRepository],
		}).compile();

		researchNodeService = module.get(ResearchNodeService);
		researchNodeRepository = module.get(ResearchNodeRepository);
	});

	describe('getResearchNodeById', () => {
		it('should return research node when research node exists', async () => {
			const researchNode = {id: 'test'} as ResearchNodeModel;

			when(researchNodeRepository.getResearchNodeById)
				.expectCalledWith('test')
				.mockResolvedValueOnce(researchNode);

			expect(await researchNodeService.getResearchNodeById('test')).toEqual(
				researchNode,
			);
		});
	});

	describe('getAllResearchNodes', () => {
		it('should return all research nodes', async () => {
			const researchNodes = [{id: 'a'}, {id: 'b'}] as ResearchNodeModel[];

			researchNodeRepository.getAllResearchNodes.mockResolvedValueOnce(
				researchNodes,
			);

			expect(await researchNodeService.getAllResearchNodes()).toEqual(
				researchNodes,
			);
		});
	});

	describe('calculateTimeInSecondsToUpgradeResearchNode', () => {
		it('should throw error when research node does not exist', async () => {
			when(researchNodeRepository.getResearchNodeById)
				.expectCalledWith('test')
				.mockResolvedValueOnce(null);

			await expect(
				researchNodeService.calculateTimeInSecondsToUpgradeResearchNode({
					startLevel: 0,
					endLevel: 1,
					researchNodeId: 'test',
				}),
			).rejects.toThrow('Research node does not exists');
		});

		it('should sum upgrade time for levels between start and end level', async () => {
			const researchNode = {
				id: 'test',
				researchNodeDetailsAtCertainLevel: [
					{details: {level: 1, timeToUpdateInSeconds: 10}},
					{details: {level: 2, timeToUpdateInSeconds: 20}},
					{details: {level: 3, timeToUpdateInSeconds: 40}},
				],
			} as unknown as ResearchNodeModel;

			when(researchNodeRepository.getResearchNodeById)
				.expectCalledWith('test')
				.mockResolvedValueOnce(researchNode);

			expect(
				await researchNodeService.calculateTimeInSecondsToUpgradeResearchNode({
					startLevel: 0,
					endLevel: 2,
					researchNodeId: 'test',
				}),
			).toEqual(30);
		});
	});
});
