import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {
	BuildingZoneRepository,
	ResourceModel,
	WarehouseDetailsModel,
} from '@warp-core/database';
import {CalculateResourceStorageService} from '@warp-core/resources/calculate/warehouse-storage/calculate-resource-storage.service';

jest.mock('@warp-core/database/repository/building-zone.repository');

describe('Resource storage calculator', () => {
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;
	let calculateStorageService: CalculateResourceStorageService;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingZoneRepository,
				AuthorizedHabitatModel,
				CalculateResourceStorageService,
			],
		}).compile();

		buildingZoneRepository = module.get(BuildingZoneRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
		calculateStorageService = module.get(CalculateResourceStorageService);
	});

	describe('calculateStorage', () => {
		it('should return 0 as resource storage when there are no warehouses connected to resource', async () => {
			authorizedHabitatModel.id = 1;
			const resourceToCheck = {
				id: 'wood',
			} as ResourceModel;

			const warehouses = [] as WarehouseDetailsModel[];

			when(buildingZoneRepository.getWarehouseForResourceAndHabitat)
				.expectCalledWith(resourceToCheck, authorizedHabitatModel.id)
				.mockResolvedValue(warehouses);

			const calculatedStorage =
				await calculateStorageService.calculateStorage(resourceToCheck);

			expect(calculatedStorage).toEqual(0);
		});

		it('should return some storage when there is single warehouse', async () => {
			authorizedHabitatModel.id = 1;
			const resourceToCheck = {
				id: 'wood',
			} as ResourceModel;

			const warehouses = [
				{
					amount: 50,
				},
			] as WarehouseDetailsModel[];

			when(buildingZoneRepository.getWarehouseForResourceAndHabitat)
				.expectCalledWith(resourceToCheck, authorizedHabitatModel.id)
				.mockResolvedValue(warehouses);

			const calculatedStorage =
				await calculateStorageService.calculateStorage(resourceToCheck);

			expect(calculatedStorage).toEqual(50);
		});

		it('should return some storage when there are multiple warehouses', async () => {
			authorizedHabitatModel.id = 1;
			const resourceToCheck = {
				id: 'wood',
			} as ResourceModel;

			const warehouses = [
				{
					amount: 50,
				},
				{
					amount: 100,
				},
			] as WarehouseDetailsModel[];

			when(buildingZoneRepository.getWarehouseForResourceAndHabitat)
				.expectCalledWith(resourceToCheck, authorizedHabitatModel.id)
				.mockResolvedValue(warehouses);

			const calculatedStorage =
				await calculateStorageService.calculateStorage(resourceToCheck);

			expect(calculatedStorage).toEqual(150);
		});
	});
});
