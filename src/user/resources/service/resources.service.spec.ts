import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {CalculationMechanic} from '@warp-core/user/resources/service/calculate/resource-calculation/calculation-mechanic.interface';
import {ResourcesService} from '@warp-core/user/resources/service/resources.service';

jest.mock('@warp-core/database/repository/habitat-resource.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock(
	'@warp-core/user/resources/service/calculate/resource-calculation/calculation-mechanic.interface',
);

describe('Resources service', () => {
	let resourcesService: ResourcesService;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let calculationMechanic: jest.Mocked<CalculationMechanic>;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResourcesService,
				HabitatResourceRepository,
				{
					provide: CalculationMechanic,
					useValue: {
						getProductionRate: jest.fn(),
					},
				},
			],
		}).compile();

		resourcesService = module.get<ResourcesService>(ResourcesService);
		habitatResourceRepository = module.get(HabitatResourceRepository);
		calculationMechanic = module.get(CalculationMechanic);
	});

	describe('getSingleResourceById', () => {
		it('should return null when habitat resource was not found', async () => {
			const resourceId = 'wood';
			const habitatId = 5;

			when(habitatResourceRepository.findOneBy)
				.calledWith(
					expect.objectContaining({
						habitatId,
						resourceId,
					}),
				)
				.mockResolvedValue(null);

			return expect(
				resourcesService.getSingleResourceById(habitatId, resourceId),
			).resolves.toBeNull();
		});

		it('should return mapped resource type when resource was found', async () => {
			const resourceId = 'wood';
			const habitatId = 5;

			const resourceModel = {
				id: resourceId,
			} as ResourceModel;
			const habitatResourceModel = {
				resource: resourceModel,
			} as HabitatResourceModel;

			when(habitatResourceRepository.findOneBy)
				.calledWith(
					expect.objectContaining({
						habitatId,
						resourceId,
					}),
				)
				.mockResolvedValue(habitatResourceModel);

			return expect(
				resourcesService.getSingleResourceById(habitatId, resourceId),
			).resolves.toBeInstanceOf(HabitatResourceCombined);
		});
	});

	describe('getAllResourcesForHabitat', () => {
		it('should return array of combined habitat resource models for habitat', async () => {
			const habitatId = 5;

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
					habitatId,
				})
				.mockResolvedValue(habitatResourceArray);

			return expect(
				resourcesService.getAllResourcesForHabitat(habitatId),
			).resolves.toMatchObject<HabitatResourceCombined>(expect.anything());
		});
	});
});
