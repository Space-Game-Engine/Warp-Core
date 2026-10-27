import {Test, TestingModule} from '@nestjs/testing';
import {DataSource, In} from 'typeorm';

import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';

jest.mock('@warp-core/database/transaction-manager.service');

describe('Habitat research node repository test', () => {
	let habitatResearchNodeRepository: HabitatResearchNodeRepository;
	let findSpy: jest.SpyInstance;
	let findOneSpy: jest.SpyInstance;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				HabitatResearchNodeRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager: (): void => {},
					},
				},
				TransactionManagerService,
			],
		}).compile();

		habitatResearchNodeRepository = module.get(HabitatResearchNodeRepository);
		findSpy = jest.spyOn(habitatResearchNodeRepository, 'find');
		findOneSpy = jest.spyOn(habitatResearchNodeRepository, 'findOne');
	});

	describe('getForHabitatAndResearchNode', () => {
		it('should query single research node for habitat', async () => {
			const habitatResearchNode = {id: '1'} as HabitatResearchNodeModel;
			findOneSpy.mockResolvedValueOnce(habitatResearchNode);

			expect(
				await habitatResearchNodeRepository.getForHabitatAndResearchNode(
					5,
					'basic_research',
				),
			).toEqual(habitatResearchNode);
			expect(findOneSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {habitatId: 5, researchNodeId: 'basic_research'},
				}),
			);
		});
	});

	describe('getForHabitatAndResearchNodes', () => {
		it('should query research nodes for habitat by provided ids', async () => {
			const habitatResearchNodes = [{id: '1'}] as HabitatResearchNodeModel[];
			findSpy.mockResolvedValueOnce(habitatResearchNodes);

			expect(
				await habitatResearchNodeRepository.getForHabitatAndResearchNodes(5, [
					'first',
					'second',
				]),
			).toEqual(habitatResearchNodes);
			expect(findSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {habitatId: 5, researchNodeId: In(['first', 'second'])},
				}),
			);
		});
	});

	describe('getAllForHabitat', () => {
		it('should query all research nodes for habitat', async () => {
			const habitatResearchNodes = [{id: '1'}] as HabitatResearchNodeModel[];
			findSpy.mockResolvedValueOnce(habitatResearchNodes);

			expect(await habitatResearchNodeRepository.getAllForHabitat(5)).toEqual(
				habitatResearchNodes,
			);
			expect(findSpy).toHaveBeenCalledWith(
				expect.objectContaining({where: {habitatId: 5}}),
			);
		});
	});
});
