import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue';
import {InsufficientResourceType} from '@warp-core/user/resources/exception/insufficient-resource.type';
import {InsufficientResourcesException} from '@warp-core/user/resources/exception/Insufficient-resources.exception';
import {ValidateQueueResourcesService} from '@warp-core/user/resources/service/validate-queue-resources.service';

jest.mock('@warp-core/database/repository/habitat-resource.repository');

describe('Validate queue resources', () => {
	let queueResourceValidatorService: ValidateQueueResourcesService;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;

	beforeAll(() => {
		prepareRepositoryMock(HabitatResourceRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [ValidateQueueResourcesService, HabitatResourceRepository],
		}).compile();

		queueResourceValidatorService = module.get<ValidateQueueResourcesService>(
			ValidateQueueResourcesService,
		);
		habitatResourceRepository = module.get(HabitatResourceRepository);
	});

	describe('useResourcesOnQueueUpdate', () => {
		it('should throw exception in edge case when resources from habitat has less quantity than required resources', async () => {
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
					currentAmount: 0,
				},
			] as HabitatResourceModel[];

			when(habitatResourceRepository.getHabitatResourcesByQueueCostItems)
				.expectCalledWith(costs, 1)
				.mockResolvedValue(habitatResources);

			await expect(
				queueResourceValidatorService.validate(queueElement),
			).rejects.toThrow(
				'Requested resources from queue does not equal resources from habitat',
			);
		});

		const insufficientResources = [
			{
				name: 'there is single resource that is not enough',
				queueCosts: [
					{
						resource: {
							id: 'wood',
							name: 'Wood',
						},
						cost: 10,
					},
				],
				habitatResources: [
					{
						resourceId: 'wood',
						currentAmount: 0,
					},
				],
				exceptionCalculationResults: [
					{
						resourceId: 'wood',
						difference: 10,
					},
				],
			},
			{
				name: 'there are multiple resources that are not enough',
				queueCosts: [
					{
						resource: {
							id: 'wood',
							name: 'Wood',
						},
						cost: 10,
					},
					{
						resource: {
							id: 'stone',
							name: 'Stone',
						},
						cost: 15,
					},
				],
				habitatResources: [
					{
						resourceId: 'wood',
						currentAmount: 0,
					},
					{
						resourceId: 'stone',
						currentAmount: 10,
					},
				],
				exceptionCalculationResults: [
					{
						resourceId: 'wood',
						difference: 10,
					},
					{
						resourceId: 'stone',
						difference: 5,
					},
				],
			},
			{
				name: 'there are multiple resources and one is not enough',
				queueCosts: [
					{
						resource: {
							id: 'wood',
							name: 'Wood',
						},
						cost: 10,
					},
					{
						resource: {
							id: 'stone',
							name: 'Stone',
						},
						cost: 15,
					},
				],
				habitatResources: [
					{
						resourceId: 'wood',
						currentAmount: 0,
					},
					{
						resourceId: 'stone',
						currentAmount: 15,
					},
				],
				exceptionCalculationResults: [
					{
						resourceId: 'wood',
						difference: 10,
					},
				],
			},
		];

		describe.each(insufficientResources)(
			'Insufficient resources',
			singleCase => {
				it(`should throw exception when ${singleCase.name}`, async () => {
					const costs = singleCase.queueCosts as QueueElementCostModel[];

					const queueElement = {
						queueElement: {
							costs,
							buildingZone: {
								habitatId: 1,
							},
						},
					} as BuildingQueueProcessing;

					const habitatResources =
						singleCase.habitatResources as HabitatResourceModel[];

					when(habitatResourceRepository.getHabitatResourcesByQueueCostItems)
						.expectCalledWith(costs, 1)
						.mockResolvedValue(habitatResources);

					try {
						await queueResourceValidatorService.validate(queueElement);
					} catch (e) {
						expect(e).toBeInstanceOf(InsufficientResourcesException);
						expect(e.insufficientResources).toHaveLength(
							singleCase.exceptionCalculationResults.length,
						);
						const insufficientResources: InsufficientResourceType[] =
							e.insufficientResources;

						for (const calculationResult of singleCase.exceptionCalculationResults) {
							const resourceFromException = <InsufficientResourceType>(
								insufficientResources.find(
									singleResourceFromException =>
										calculationResult.resourceId ===
										singleResourceFromException.resourceId,
								)
							);
							const queueCost = singleCase.queueCosts.find(
								singleElement =>
									singleElement.resource.id === calculationResult.resourceId,
							);

							const habitatResource = singleCase.habitatResources.find(
								singleResource =>
									singleResource.resourceId === calculationResult.resourceId,
							);

							if (
								typeof queueCost === 'undefined' ||
								typeof habitatResource === 'undefined'
							) {
								continue;
							}

							expect(resourceFromException.resourceId).toEqual(
								queueCost.resource.id,
							);
							expect(resourceFromException.requiredResources).toEqual(
								queueCost.cost,
							);
							expect(resourceFromException.currentResources).toEqual(
								habitatResource.currentAmount,
							);
							expect(resourceFromException.difference).toEqual(
								calculationResult.difference,
							);
						}
					}
				});
			},
		);
	});
});
