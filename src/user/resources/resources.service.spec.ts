import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {ResourcesService} from '@warp-core/user/resources/resources.service';

jest.mock('@warp-core/database/repository/habitat-resource.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Resources service', () => {
	let resourcesService: ResourcesService;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResourcesService,
				HabitatResourceRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		resourcesService = module.get<ResourcesService>(ResourcesService);
		habitatResourceRepository = module.get(HabitatResourceRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
	});

	describe('getSingleResourceById', () => {
		it('should return null when habitat resource was not found', async () => {
			const resourceId = 'wood';
			authorizedHabitatModel.id = 5;

			when(habitatResourceRepository.findOneBy)
				.calledWith(
					expect.objectContaining({
						habitatId: authorizedHabitatModel.id,
						resourceId: resourceId,
					}),
				)
				.mockResolvedValue(null);

			expect(
				resourcesService.getSingleResourceById(resourceId),
			).resolves.toBeNull();
		});

		it('should return mapped resource model when resource was found', async () => {
			const resourceId = 'wood';
			authorizedHabitatModel.id = 5;

			const resourceModel = {
				id: resourceId,
			} as ResourceModel;
			const habitatResourceModel = {
				resource: resourceModel,
			} as HabitatResourceModel;

			when(habitatResourceRepository.findOneBy)
				.calledWith(
					expect.objectContaining({
						habitatId: authorizedHabitatModel.id,
						resourceId: resourceId,
					}),
				)
				.mockResolvedValue(habitatResourceModel);

			expect(
				resourcesService.getSingleResourceById(resourceId),
			).resolves.toBeInstanceOf(HabitatResourceCombined);
		});
	});

	describe('getAllResourcesForHabitat', () => {
		it('should return array of combined habitat resource models for authorized habitat', async () => {
			authorizedHabitatModel.id = 5;

			const habitatResourceArray = [
				{
					id: '1',
					resource: {
						id: 'wood',
					},
				},
				{
					id: '2',
					resource: {
						id: 'steel',
					},
				},
				{
					id: '3',
					resource: {
						id: 'stone',
					},
				},
			] as HabitatResourceModel[];

			when(habitatResourceRepository.findBy)
				.calledWith({
					habitatId: 5,
				})
				.mockResolvedValue(habitatResourceArray);

			expect(
				await resourcesService.getAllResourcesForHabitat(),
			).toMatchObject<HabitatResourceCombined>(expect.anything());
		});

		it('should return array of combined habitat resource models for provided habitat', async () => {
			const habitatModel = {id: 10} as HabitatModel;

			const habitatResourceArray = [
				{
					id: '1',
					resource: {
						id: 'wood',
					},
				},
				{
					id: '2',
					resource: {
						id: 'steel',
					},
				},
				{
					id: '3',
					resource: {
						id: 'stone',
					},
				},
			] as HabitatResourceModel[];

			when(habitatResourceRepository.findBy)
				.calledWith({
					habitatId: 10,
				})
				.mockResolvedValue(habitatResourceArray);

			expect(
				await resourcesService.getAllResourcesForHabitat(habitatModel),
			).toMatchObject<HabitatResourceCombined>(expect.anything());
		});
	});
});
