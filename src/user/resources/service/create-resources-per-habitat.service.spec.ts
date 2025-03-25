import {Test, TestingModule} from '@nestjs/testing';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {ResourceRepository} from '@warp-core/database/repository/resource.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {CreateResourcesPerHabitatService} from '@warp-core/user/resources/service/create-resources-per-habitat.service';

jest.mock('@warp-core/database/repository/habitat-resource.repository');
jest.mock('@warp-core/database/repository/resource.repository');

describe('Create resources per habitat service tests', () => {
	let createResourcesPerHabitat: CreateResourcesPerHabitatService;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let resourceRepository: jest.Mocked<ResourceRepository>;

	beforeAll(() => {
		prepareRepositoryMock(HabitatResourceRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateResourcesPerHabitatService,
				HabitatResourceRepository,
				ResourceRepository,
			],
		}).compile();

		createResourcesPerHabitat = module.get<CreateResourcesPerHabitatService>(
			CreateResourcesPerHabitatService,
		);
		habitatResourceRepository = module.get(HabitatResourceRepository);
		resourceRepository = module.get(ResourceRepository);
	});

	describe('createResourcesPerHabitat', () => {
		it('should not save any resources when resources list is empty', async () => {
			const resourcesList = [] as ResourceModel[];
			const habitat = {
				id: 1,
			} as HabitatModel;

			resourceRepository.find.mockResolvedValue(resourcesList);

			await createResourcesPerHabitat.createResourcesPerHabitat({habitat});
		});

		it('should save one habitat resource when there is one resource to be saved', async () => {
			const resourcesList = [
				{
					id: 'wood',
				},
			] as ResourceModel[];
			const habitat = {
				id: 1,
			} as HabitatModel;

			resourceRepository.find.mockResolvedValue(resourcesList);

			await createResourcesPerHabitat.createResourcesPerHabitat({habitat});

			expect(habitatResourceRepository.insert).toBeCalledTimes(1);
			expect(habitatResourceRepository.insert).toHaveBeenCalledWith(
				expect.arrayContaining<HabitatResourceModel>([
					expect.objectContaining({
						habitat: habitat,
						resource: resourcesList[0],
					}),
				]),
			);
		});

		it('should save multiple habitat resource when there are multiple resources to be saved', async () => {
			const resourcesList = [
				{
					id: 'wood',
				},
				{
					id: 'stone',
				},
				{
					id: 'water',
				},
			] as ResourceModel[];
			const habitat = {
				id: 1,
			} as HabitatModel;

			resourceRepository.find.mockResolvedValue(resourcesList);

			await createResourcesPerHabitat.createResourcesPerHabitat({habitat});

			expect(habitatResourceRepository.insert).toBeCalledTimes(1);
			expect(habitatResourceRepository.insert).toHaveBeenCalledWith(
				expect.arrayContaining<HabitatResourceModel>([
					expect.objectContaining({
						habitat: habitat,
						resource: resourcesList[0],
					}),
					expect.objectContaining({
						habitat: habitat,
						resource: resourcesList[1],
					}),
					expect.objectContaining({
						habitat: habitat,
						resource: resourcesList[2],
					}),
				]),
			);
		});
	});
});
