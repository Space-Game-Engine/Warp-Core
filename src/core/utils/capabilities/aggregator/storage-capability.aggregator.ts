import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {StorageLink} from '@warp-core/core/utils/capabilities/storage-link.util';
import {
	CalculatedCapabilitiesModel,
	CalculatedStorageCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Storage entries with the same storage type, resource type and resource id are merged.
 */
@Injectable()
export class StorageCapabilityAggregator extends CapabilityAggregatorInterface<
	Map<string, CalculatedStorageCapabilityModel>
> {
	public createState(): Map<string, CalculatedStorageCapabilityModel> {
		return new Map();
	}

	public async addSource(
		state: Map<string, CalculatedStorageCapabilityModel>,
		source: CapabilitiesModel,
	): Promise<void> {
		for (const storageEntry of (await source.storage) ?? []) {
			const key = this.buildStorageKey(storageEntry);
			const existingEntry = state.get(key);

			if (!existingEntry) {
				const entry = new CalculatedStorageCapabilityModel();
				entry.storageType = storageEntry.storageType;
				entry.resourceType = storageEntry.resourceType ?? null;
				entry.resourceId = storageEntry.resourceId ?? null;
				entry.amount = storageEntry.amount;
				state.set(key, entry);
				continue;
			}

			existingEntry.amount += storageEntry.amount;
		}
	}

	public applyToResult(
		state: Map<string, CalculatedStorageCapabilityModel>,
		result: CalculatedCapabilitiesModel,
	): void {
		result.storage = Array.from(state.values());
	}

	private buildStorageKey(storageEntry: StorageLink): string {
		return [
			storageEntry.storageType,
			storageEntry.resourceType ?? '',
			storageEntry.resourceId ?? '',
		].join('|');
	}
}
