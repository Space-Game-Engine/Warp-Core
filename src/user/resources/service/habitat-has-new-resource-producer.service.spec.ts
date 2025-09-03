import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingProductionRateModel} from '@warp-core/database/model/building-production-rate.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingRepository} from '@warp-core/database/repository/building.repository';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {HabitatHasNewResourceProducerService} from '@warp-core/user/resources/service/habitat-has-new-resource-producer.service';

jest.mock('@warp-core/database/repository/building.repository');
jest.mock('@warp-core/database/repository/habitat-resource.repository');

describe('Add last calculation date for new resource producers', () => {
	let buildingRepository: jest.Mocked<BuildingRepository>;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;
	let habitatHasNewResourceProducerSubscriber: HabitatHasNewResourceProducerService;

	beforeAll(() => {
		prepareRepositoryMock(HabitatResourceRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingRepository,
				HabitatResourceRepository,
				AuthorizedHabitatModel,
				HabitatHasNewResourceProducerService,
			],
		}).compile();

		buildingRepository = module.get(BuildingRepository);
		habitatResourceRepository = module.get(HabitatResourceRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
		habitatHasNewResourceProducerSubscriber = module.get(
			HabitatHasNewResourceProducerService,
		);
	});

	describe('updateLastCalculationDateOnHabitatResource', () => {
		it('should do nothing when building does not produce anything ad selected level', async () => {
			authorizedHabitatModel.id = 5;
			const queueElement = {
				endLevel: 5,
				buildingId: 'test',
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

			expect(
				habitatResourceRepository.updateLastCalculationDateForManyResources,
			).toHaveBeenCalledTimes(0);
		});

		it('should update habitat resource when building produce resources', async () => {
			authorizedHabitatModel.id = 5;
			const queueElement = {
				endLevel: 5,
				buildingId: 'test',
			} as BuildingQueueElementModel;

			const productionRateModels = [
				{
					resourceId: 'wood',
				},
				{
					resourceId: 'coal',
				},
			] as BuildingProductionRateModel[];

			when(buildingRepository.getProductionRateForProvidedLevel)
				.expectCalledWith(
					queueElement.buildingId as string,
					queueElement.endLevel,
				)
				.mockResolvedValue(productionRateModels);

			await habitatHasNewResourceProducerSubscriber.updateLastCalculationDateOnHabitatResource(
				{queueElement: queueElement},
			);

			expect(
				habitatResourceRepository.updateLastCalculationDateForManyResources,
			).toHaveBeenCalledTimes(1);
		});
	});
});
