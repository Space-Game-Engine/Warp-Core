import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {StorageTypeEnum} from '@warp-core/database/enum/storage-type.enum';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';

export type StorageLink = {
	storageType: StorageTypeEnum;
	resourceType?: ResourceTypeEnum | null;
	resourceId?: string | null;
};

/**
 * Checks if a storage entry (from a blueprint or a calculated one) accepts provided resource.
 */
export function isStorageLinkedToResource(
	storage: StorageLink,
	resource: ResourceModel,
): boolean {
	switch (storage.storageType) {
		case StorageTypeEnum.ANY_RESOURCE:
			return true;
		case StorageTypeEnum.ONE_TYPE_OF_RESOURCE:
			return resource.type === storage.resourceType;
		case StorageTypeEnum.ONE_KIND_OF_RESOURCE:
			return resource.id === storage.resourceId;
		default:
			return false;
	}
}
