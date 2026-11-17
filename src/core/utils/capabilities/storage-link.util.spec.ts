import {isStorageLinkedToResource} from '@warp-core/core/utils/capabilities/storage-link.util';
import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {StorageTypeEnum} from '@warp-core/database/enum/storage-type.enum';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';

describe('Storage link util', () => {
	const wood = {
		id: 'wood',
		type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
	} as ResourceModel;

	describe('isStorageLinkedToResource', () => {
		const testCases = [
			{
				name: 'storage accepts any resource',
				storage: {storageType: StorageTypeEnum.ANY_RESOURCE},
				expected: true,
			},
			{
				name: 'storage accepts the resource type',
				storage: {
					storageType: StorageTypeEnum.ONE_TYPE_OF_RESOURCE,
					resourceType: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
				},
				expected: true,
			},
			{
				name: 'storage accepts another resource type',
				storage: {
					storageType: StorageTypeEnum.ONE_TYPE_OF_RESOURCE,
					resourceType: ResourceTypeEnum.ENERGY_RESOURCE,
				},
				expected: false,
			},
			{
				name: 'storage accepts the resource id',
				storage: {
					storageType: StorageTypeEnum.ONE_KIND_OF_RESOURCE,
					resourceId: 'wood',
				},
				expected: true,
			},
			{
				name: 'storage accepts another resource id',
				storage: {
					storageType: StorageTypeEnum.ONE_KIND_OF_RESOURCE,
					resourceId: 'coal',
				},
				expected: false,
			},
			{
				name: 'storage type is unknown',
				storage: {storageType: 'unknown' as StorageTypeEnum},
				expected: false,
			},
		];

		it.each(testCases)(
			'should return $expected when $name',
			({storage, expected}) => {
				expect(isStorageLinkedToResource(storage, wood)).toBe(expected);
			},
		);
	});
});
