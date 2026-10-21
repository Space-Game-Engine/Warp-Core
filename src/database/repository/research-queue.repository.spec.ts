import {Test, TestingModule} from '@nestjs/testing';
import {DataSource, LessThanOrEqual, MoreThanOrEqual} from 'typeorm';

import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';

jest.mock('@warp-core/database/transaction-manager.service');

describe('Research queue repository test', () => {
	let researchQueueRepository: ResearchQueueRepository;
	let findSpy: jest.SpyInstance;
	let findBySpy: jest.SpyInstance;
	let countSpy: jest.SpyInstance;
	let saveSpy: jest.SpyInstance;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResearchQueueRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager: (): void => {},
					},
				},
				TransactionManagerService,
			],
		}).compile();

		researchQueueRepository = module.get(ResearchQueueRepository);
		findSpy = jest.spyOn(researchQueueRepository, 'find');
		findBySpy = jest.spyOn(researchQueueRepository, 'findBy');
		countSpy = jest.spyOn(researchQueueRepository, 'count');
		saveSpy = jest.spyOn(researchQueueRepository, 'save');
	});

	describe('getCurrentQueueForHabitat', () => {
		it('should load active research queue elements for habitat', async () => {
			const queueElements = [{id: 10}, {id: 11}] as ResearchQueueElementModel[];
			findSpy.mockResolvedValue(queueElements);

			const result = await researchQueueRepository.getCurrentQueueForHabitat(5);

			expect(result).toEqual(queueElements);
			expect(findSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						habitatId: 5,
						endTime: MoreThanOrEqual(expect.any(Date)),
					},
				}),
			);
		});
	});

	describe('getCurrentResearchQueueForResearchNode', () => {
		it('should load active research queue elements for single research node in habitat', async () => {
			const queueElements = [{id: 10}] as ResearchQueueElementModel[];
			findSpy.mockResolvedValue(queueElements);

			const result =
				await researchQueueRepository.getCurrentResearchQueueForResearchNode(
					'basic_research',
					5,
				);

			expect(result).toEqual(queueElements);
			expect(findSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						habitatId: 5,
						researchNodeId: 'basic_research',
						endTime: MoreThanOrEqual(expect.any(Date)),
					},
				}),
			);
		});
	});

	describe('countActiveQueueElementsForHabitat', () => {
		it('should count active research queue elements for habitat', async () => {
			countSpy.mockResolvedValue(3);

			const result =
				await researchQueueRepository.countActiveQueueElementsForHabitat(5);

			expect(result).toBe(3);
			expect(countSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						habitatId: 5,
						endTime: MoreThanOrEqual(expect.any(Date)),
					},
				}),
			);
		});
	});

	describe('getUnresolvedQueueForHabitat', () => {
		it('should load ended and not consumed research queue elements for habitat', async () => {
			const queueElements = [{id: 10}] as ResearchQueueElementModel[];
			findBySpy.mockResolvedValue(queueElements);

			const result =
				await researchQueueRepository.getUnresolvedQueueForHabitat(5);

			expect(result).toEqual(queueElements);
			expect(findBySpy).toHaveBeenCalledWith({
				isConsumed: false,
				endTime: LessThanOrEqual(expect.any(Date)),
				habitatId: 5,
			});
		});
	});

	describe('markElementAsConsumed', () => {
		it('should save queue element marked as consumed', async () => {
			const queueElement = {
				id: 10,
				isConsumed: false,
			} as ResearchQueueElementModel;
			saveSpy.mockResolvedValue(queueElement);

			await researchQueueRepository.markElementAsConsumed(queueElement);

			expect(saveSpy).toHaveBeenCalledWith(
				expect.objectContaining({id: 10, isConsumed: true}),
			);
		});
	});
});
