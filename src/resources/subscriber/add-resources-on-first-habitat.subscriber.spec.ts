import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {
	HabitatModel,
	HabitatResourceModel,
	HabitatResourceRepository,
} from '@warp-core/database';
import {AddResourcesOnFirstHabitatSubscriber} from '@warp-core/resources/subscriber/add-resources-on-first-habitat.subscriber';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';

jest.mock('@warp-core/database/repository/habitat-resource.repository');
describe('Add resources on first user habitat', () => {
	let runtimeConfig: RuntimeConfig;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let addResourcesOnFirstHabitat: AddResourcesOnFirstHabitatSubscriber;

	beforeAll(() => {
		prepareRepositoryMock(HabitatResourceRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AddResourcesOnFirstHabitatSubscriber,
				HabitatResourceRepository,
				coreConfigMock,
			],
		}).compile();

		addResourcesOnFirstHabitat = module.get(
			AddResourcesOnFirstHabitatSubscriber,
		);
		runtimeConfig = module.get(RuntimeConfig);
		habitatResourceRepository = module.get(HabitatResourceRepository);
	});

	describe('addResourcesToHabitat', () => {
		it('should not add any resources if they are not defined in config', async () => {
			runtimeConfig.habitat.onStart.resources = [];

			const newHabitat = {
				id: 1,
			} as HabitatModel;

			await addResourcesOnFirstHabitat.addResourcesToHabitat({
				habitat: newHabitat,
			});

			expect(
				habitatResourceRepository.getHabitatResourcesByIds,
			).toBeCalledTimes(0);
		});

		it('should set basic amount of resources without setting lastCalculationTime', async () => {
			runtimeConfig.habitat.onStart.resources = [
				{
					id: 'wood',
					amount: 100,
				},
			];

			const newHabitat = {
				id: 1,
			} as HabitatModel;

			const habitatResources = [
				{
					resourceId: 'wood',
					currentAmount: 0,
					lastCalculationTime: null,
				},
			] as HabitatResourceModel[];

			when(habitatResourceRepository.getHabitatResourcesByIds)
				.calledWith(['wood'], newHabitat.id)
				.mockResolvedValue(habitatResources);

			await addResourcesOnFirstHabitat.addResourcesToHabitat({
				habitat: newHabitat,
			});

			expect(habitatResources[0].currentAmount).toEqual(100);
			expect(habitatResources[0].lastCalculationTime).toEqual(null);

			expect(habitatResourceRepository.update).toBeCalledTimes(1);
			expect(habitatResourceRepository.update).toBeCalledWith(
				habitatResources[0].id,
				{currentAmount: 100},
			);
		});
	});
});
