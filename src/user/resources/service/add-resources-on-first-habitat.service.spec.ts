import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {AddResourcesOnFirstHabitatService} from '@warp-core/user/resources/service/add-resources-on-first-habitat.service';

jest.mock('@warp-core/database/repository/habitat-resource.repository');

describe('Add resources on first user habitat', () => {
	let runtimeConfig: RuntimeConfig;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let addResourcesOnFirstHabitat: AddResourcesOnFirstHabitatService;

	beforeAll(() => {
		prepareRepositoryMock(HabitatResourceRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AddResourcesOnFirstHabitatService,
				HabitatResourceRepository,
				coreConfigMock,
			],
		}).compile();

		addResourcesOnFirstHabitat = module.get(AddResourcesOnFirstHabitatService);
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
			).toHaveBeenCalledTimes(0);
		});

		it('should set basic amount of resources without changing lastCalculationTime', async () => {
			runtimeConfig.habitat.onStart.resources = [
				{
					id: 'wood',
					amount: 100,
				},
			];

			const lastCalculationTime = new Date();

			const newHabitat = {
				id: 1,
			} as HabitatModel;

			const habitatResources = [
				{
					resourceId: 'wood',
					currentAmount: 0,
					lastCalculationTime,
				},
			] as HabitatResourceModel[];

			when(habitatResourceRepository.getHabitatResourcesByIds)
				.calledWith(['wood'], newHabitat.id)
				.mockResolvedValue(habitatResources);

			await addResourcesOnFirstHabitat.addResourcesToHabitat({
				habitat: newHabitat,
			});

			expect(habitatResources[0].currentAmount).toEqual(100);
			expect(habitatResources[0].lastCalculationTime).toEqual(
				lastCalculationTime,
			);

			expect(habitatResourceRepository.update).toHaveBeenCalledTimes(1);
			expect(habitatResourceRepository.update).toHaveBeenCalledWith(
				habitatResources[0].id,
				{currentAmount: 100},
			);
		});
	});
});
