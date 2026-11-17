import {
	CalculatedCapabilitiesModel,
	CalculatedProductionCapabilityModel,
	CalculatedStorageCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Sums capabilities from multiple sources (e.g. global blueprint at certain level
 * and player blueprint bonuses) into one set of effective values.
 *
 * Production flows are grouped per resource. The interval of the first flow
 * for a resource is kept and other flows are rescaled to it.
 * Storage entries with the same storage type, resource type and resource id are merged.
 */
export async function sumCapabilities(
	sources: (CapabilitiesModel | null | undefined)[],
): Promise<CalculatedCapabilitiesModel> {
	const production = new Map<string, CalculatedProductionCapabilityModel>();
	const storage = new Map<string, CalculatedStorageCapabilityModel>();

	for (const source of sources) {
		if (!source) {
			continue;
		}

		for (const flow of (await source.production) ?? []) {
			addProduction(production, flow.resourceId, flow.amount, flow.interval);
		}

		for (const storageEntry of (await source.storage) ?? []) {
			addStorage(storage, storageEntry);
		}
	}

	const calculatedCapabilities = new CalculatedCapabilitiesModel();
	calculatedCapabilities.production = Array.from(production.values());
	calculatedCapabilities.storage = Array.from(storage.values());

	return calculatedCapabilities;
}

function addProduction(
	production: Map<string, CalculatedProductionCapabilityModel>,
	resourceId: string,
	amount: number,
	interval: number,
): void {
	const existingFlow = production.get(resourceId);

	if (!existingFlow) {
		const flow = new CalculatedProductionCapabilityModel();
		flow.resourceId = resourceId;
		flow.amount = amount;
		flow.interval = interval;
		flow.amountPerSecond = amount / interval;
		production.set(resourceId, flow);
		return;
	}

	existingFlow.amount += (amount * existingFlow.interval) / interval;
	existingFlow.amountPerSecond = existingFlow.amount / existingFlow.interval;
}

function addStorage(
	storage: Map<string, CalculatedStorageCapabilityModel>,
	storageEntry: CalculatedStorageCapabilityModel,
): void {
	const key = [
		storageEntry.storageType,
		storageEntry.resourceType ?? '',
		storageEntry.resourceId ?? '',
	].join('|');
	const existingEntry = storage.get(key);

	if (!existingEntry) {
		const entry = new CalculatedStorageCapabilityModel();
		entry.storageType = storageEntry.storageType;
		entry.resourceType = storageEntry.resourceType ?? null;
		entry.resourceId = storageEntry.resourceId ?? null;
		entry.amount = storageEntry.amount;
		storage.set(key, entry);
		return;
	}

	existingEntry.amount += storageEntry.amount;
}
