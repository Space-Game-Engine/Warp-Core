import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {
	BuildingProductionRateModel,
	BuildingQueueElementModel,
	BuildingRepository,
	HabitatResourceRepository,
} from '@warp-core/database';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {HabitatHasNewResourceProducerSubscriber} from '@warp-core/user/resources/subscriber/habitat-has-new-resource-producer.subscriber';

jest.mock('@warp-core/database/repository/building.repository');
jest.mock('@warp-core/database/repository/habitat-resource.repository');

describe('Add last calculation date for new resource producers', () => {
	let buildingRepository: jest.Mocked<BuildingRepository>;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;
	let habitatHasNewResourceProducerSubscriber: HabitatHasNewResourceProducerSubscriber;

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
				HabitatHasNewResourceProducerSubscriber,
			],
		}).compile();

		buildingRepository = module.get(BuildingRepository);
		habitatResourceRepository = module.get(HabitatResourceRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
		habitatHasNewResourceProducerSubscriber = module.get(
			HabitatHasNewResourceProducerSubscriber,
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
			).toBeCalledTimes(0);
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
			).toBeCalledTimes(1);
		});
	});
});
