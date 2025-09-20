import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {WarehouseDetailsModel} from '@warp-core/database/model/warehouse-details.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BaseResourceStorageService} from '@warp-core/user/resources/service/calculate/warehouse-storage/base-resource-storage.service';

jest.mock('@warp-core/database/repository/building-zone.repository');

describe('Base resource storage calculator', () => {
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let calculateStorageService: BaseResourceStorageService;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [BuildingZoneRepository, BaseResourceStorageService],
		}).compile();

		buildingZoneRepository = module.get(BuildingZoneRepository);
		calculateStorageService = module.get(BaseResourceStorageService);
	});

	describe('calculateStorage', () => {
		it('should return 0 as resource storage when there are no warehouses connected to resource', async () => {
			const habitatModel = {
				id: 1,
			} as HabitatModel;
			const resourceToCheck = {
				id: 'wood',
			} as ResourceModel;

			const warehouses = [] as WarehouseDetailsModel[];

			when(buildingZoneRepository.getWarehouseForResourceAndHabitat)
				.expectCalledWith(resourceToCheck, habitatModel.id)
				.mockResolvedValue(warehouses);

			const calculatedStorage = await calculateStorageService.calculateStorage(
				resourceToCheck,
				habitatModel,
			);

			expect(calculatedStorage).toEqual(0);
		});

		it('should return some storage when there is single warehouse', async () => {
			const habitatModel = {
				id: 1,
			} as HabitatModel;
			const resourceToCheck = {
				id: 'wood',
			} as ResourceModel;

			const warehouses = [
				{
					amount: 50,
				},
			] as WarehouseDetailsModel[];

			when(buildingZoneRepository.getWarehouseForResourceAndHabitat)
				.expectCalledWith(resourceToCheck, habitatModel.id)
				.mockResolvedValue(warehouses);

			const calculatedStorage = await calculateStorageService.calculateStorage(
				resourceToCheck,
				habitatModel,
			);

			expect(calculatedStorage).toEqual(50);
		});

		it('should return some storage when there are multiple warehouses', async () => {
			const habitatModel = {
				id: 1,
			} as HabitatModel;
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
				.expectCalledWith(resourceToCheck, habitatModel.id)
				.mockResolvedValue(warehouses);

			const calculatedStorage = await calculateStorageService.calculateStorage(
				resourceToCheck,
				habitatModel,
			);

			expect(calculatedStorage).toEqual(150);
		});
	});
});
