import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {BuildingProductionRateModel} from '@warp-core/database/model/building-production-rate.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {BuildingRepository} from '@warp-core/database/repository/building.repository';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {ResourceCalculatorService} from '@warp-core/user/resources/service/calculate/resource-calculator.service';
import {RecalculateResourcesOnQueueUpdate} from '@warp-core/user/resources/service/recalculate-resources-on-queue-update.service';

jest.mock('@warp-core/database/repository/building.repository');
jest.mock('@warp-core/database/repository/habitat-resource.repository');
jest.mock(
	'@warp-core/user/resources/service/calculate/resource-calculator.service',
);

describe('Add last calculation date for new resource producers', () => {
	let buildingRepository: jest.Mocked<BuildingRepository>;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let resourceCalculatorService: jest.Mocked<ResourceCalculatorService>;
	let habitatHasNewResourceProducerSubscriber: RecalculateResourcesOnQueueUpdate;

	beforeAll(() => {
		prepareRepositoryMock(HabitatResourceRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingRepository,
				HabitatResourceRepository,
				RecalculateResourcesOnQueueUpdate,
				ResourceCalculatorService,
			],
		}).compile();

		buildingRepository = module.get(BuildingRepository);
		habitatResourceRepository = module.get(HabitatResourceRepository);
		resourceCalculatorService = module.get(ResourceCalculatorService);
		habitatHasNewResourceProducerSubscriber = module.get(
			RecalculateResourcesOnQueueUpdate,
		);
	});

	describe('updateLastCalculationDateOnHabitatResource', () => {
		it('should do nothing when building does not produce anything ad selected level', async () => {
			const habitatId = 5;
			const queueElement = {
				endLevel: 5,
				buildingId: 'test',
				buildingZone: {
					habitatId,
				},
			} as BuildingQueueElementModel;

			const productionRateModels = [] as BuildingProductionRateModel[];

			when(buildingRepository.getProductionRateForProvidedLevel)
				.expectCalledWith(
					queueElement.buildingId as string,
					queueElement.endLevel,
				)
				.mockResolvedValue(productionRateModels);

			await habitatHasNewResourceProducerSubscriber.updateLastCalculationDateOnHabitatResource(
				{queueElement: queueElement},
			);

			expect(habitatResourceRepository.save).toHaveBeenCalledTimes(0);

			expect(
				resourceCalculatorService.calculateSingleResource,
			).toHaveBeenCalledTimes(0);
		});

		it('should update habitat resource when building produce resources', async () => {
			const habitatId = 5;
			const queueElement = {
				endLevel: 5,
				buildingId: 'test',
				endTime: new Date(),
				buildingZone: {
					habitatId,
				},
			} as BuildingQueueElementModel;

			const productionRateModels = [
				{
					resourceId: 'wood',
				},
				{
					resourceId: 'coal',
				},
			] as BuildingProductionRateModel[];

			const resources = [
				{
					resourceId: 'wood',
					lastCalculationTime: new Date(),
				},
				{
					resourceId: 'coal',
					lastCalculationTime: new Date(),
				},
			] as HabitatResourceModel[];

			when(buildingRepository.getProductionRateForProvidedLevel)
				.expectCalledWith(
					queueElement.buildingId as string,
					queueElement.endLevel,
				)
				.mockResolvedValue(productionRateModels);

			when(habitatResourceRepository.getHabitatResourcesByIds)
				.expectCalledWith(
					productionRateModels.map(productionRate => productionRate.resourceId),
					habitatId,
				)
				.mockResolvedValue(resources);

			await habitatHasNewResourceProducerSubscriber.updateLastCalculationDateOnHabitatResource(
				{queueElement: queueElement},
			);

			expect(habitatResourceRepository.save).toHaveBeenCalledTimes(1);

			expect(
				resourceCalculatorService.calculateSingleResource,
			).toHaveBeenCalledTimes(2);
		});
	});
});
