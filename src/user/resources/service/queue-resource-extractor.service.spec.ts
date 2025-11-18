import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue';
import {QueueResourceExtractorService} from '@warp-core/user/resources/service/queue-resource-extractor.service';

jest.mock('@warp-core/database/repository/habitat-resource.repository');

describe('Resource extraction service', () => {
	let resourceExtractorService: QueueResourceExtractorService;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;

	beforeAll(() => {
		prepareRepositoryMock(HabitatResourceRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [QueueResourceExtractorService, HabitatResourceRepository],
		}).compile();

		resourceExtractorService = module.get<QueueResourceExtractorService>(
			QueueResourceExtractorService,
		);
		habitatResourceRepository = module.get(HabitatResourceRepository);
	});

	describe('useResourcesOnQueueUpdate', () => {
		it('should extract resources when user have enough resources to be used', async () => {
			const costs = [
				{
					resource: {
						id: 'wood',
					},
					cost: 10,
				},
				{
					resource: {
						id: 'stone',
					},
					cost: 10,
				},
			] as QueueElementCostModel[];

			const queueElement = {
				queueElement: {
					costs,
					buildingZone: {
						habitatId: 1,
					},
				},
			} as BuildingQueueProcessing;

			const habitatResources = [
				{
					resourceId: 'wood',
					currentAmount: 10,
				},
				{
					resourceId: 'stone',
					currentAmount: 10,
				},
			] as HabitatResourceModel[];

			when(habitatResourceRepository.getHabitatResourcesByQueueCostItems)
				.expectCalledWith(costs, 1)
				.mockResolvedValue(habitatResources);

			await resourceExtractorService.useResourcesOnQueueUpdate(queueElement);

			expect(habitatResources[0].currentAmount).toEqual(0);
			expect(habitatResources[1].currentAmount).toEqual(0);

			expect(habitatResourceRepository.update).toHaveBeenCalledTimes(2);
		});
	});
});
