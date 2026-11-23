import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {StorageTypeEnum} from '@warp-core/database/enum/storage-type.enum';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';
import {
	BuildingZoneCapabilities,
	BuildingZoneEmitter,
} from '@warp-core/user/building-zone';
import {BaseResourceStorageService} from '@warp-core/user/resources/service/calculate/warehouse-storage/base-resource-storage.service';

jest.mock('@warp-core/user/building-zone/exchange/query/building-zone.emitter');

describe('Base resource storage calculator', () => {
	let buildingZoneEmitter: jest.Mocked<BuildingZoneEmitter>;
	let calculateStorageService: BaseResourceStorageService;

	const habitatModel = {id: 1} as HabitatModel;
	const resourceToCheck = {
		id: 'wood',
		type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
	} as ResourceModel;

	function mockStorage(
		zonesStorage: {
			storageType: StorageTypeEnum;
			amount: number;
			resourceType?: ResourceTypeEnum;
			resourceId?: string;
		}[][],
	): void {
		const zonesCapabilities = zonesStorage.map(storage => ({
			capabilities: {production: [], storage},
		})) as unknown as BuildingZoneCapabilities[];

		when(buildingZoneEmitter.getCalculatedCapabilitiesForHabitat)
			.expectCalledWith({habitatId: habitatModel.id})
			.mockResolvedValue({data: zonesCapabilities, error: undefined});
	}

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [BuildingZoneEmitter, BaseResourceStorageService],
		}).compile();

		buildingZoneEmitter = module.get(BuildingZoneEmitter);
		calculateStorageService = module.get(BaseResourceStorageService);
	});

	describe('calculateStorage', () => {
		it('should return 0 as resource storage when there are no building zones with storage', async () => {
			mockStorage([]);

			expect(
				await calculateStorageService.calculateStorage(
					resourceToCheck,
					habitatModel,
				),
			).toEqual(0);
		});

		it('should return storage amount when there is single storage for any resource', async () => {
			mockStorage([[{storageType: StorageTypeEnum.ANY_RESOURCE, amount: 50}]]);

			expect(
				await calculateStorageService.calculateStorage(
					resourceToCheck,
					habitatModel,
				),
			).toEqual(50);
		});

		it('should sum storage of different types when all of them accept the resource', async () => {
			mockStorage([
				[{storageType: StorageTypeEnum.ANY_RESOURCE, amount: 50}],
				[
					{
						storageType: StorageTypeEnum.ONE_TYPE_OF_RESOURCE,
						resourceType: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
						amount: 100,
					},
					{
						storageType: StorageTypeEnum.ONE_KIND_OF_RESOURCE,
						resourceId: 'wood',
						amount: 25,
					},
				],
			]);

			expect(
				await calculateStorageService.calculateStorage(
					resourceToCheck,
					habitatModel,
				),
			).toEqual(175);
		});

		it('should skip storage that does not accept the resource', async () => {
			mockStorage([
				[
					{storageType: StorageTypeEnum.ANY_RESOURCE, amount: 50},
					{
						storageType: StorageTypeEnum.ONE_TYPE_OF_RESOURCE,
						resourceType: ResourceTypeEnum.ENERGY_RESOURCE,
						amount: 100,
					},
					{
						storageType: StorageTypeEnum.ONE_KIND_OF_RESOURCE,
						resourceId: 'coal',
						amount: 25,
					},
				],
			]);

			expect(
				await calculateStorageService.calculateStorage(
					resourceToCheck,
					habitatModel,
				),
			).toEqual(50);
		});

		it('should throw internal emitter error when capabilities cannot be fetched', async () => {
			when(buildingZoneEmitter.getCalculatedCapabilitiesForHabitat)
				.expectCalledWith({habitatId: habitatModel.id})
				.mockResolvedValue({
					data: undefined,
					error: {message: 'boom', trace: undefined},
				});

			await expect(
				calculateStorageService.calculateStorage(resourceToCheck, habitatModel),
			).rejects.toThrow('boom');
		});
	});
});
