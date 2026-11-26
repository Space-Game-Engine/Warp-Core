import {CalculatedCapabilityTargetModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilityTargetModel} from '@warp-core/database/model/capability/capability-target.model';

/**
 * Adds targets to the map, skipping the ones with the same type and value.
 */
export function mergeCapabilityTargets(
	targetsMap: Map<string, CalculatedCapabilityTargetModel>,
	targets: CapabilityTargetModel[],
): void {
	for (const {type, value} of targets) {
		const key = `${type}|${value}`;
		if (targetsMap.has(key)) {
			continue;
		}

		const target = new CalculatedCapabilityTargetModel();
		target.type = type;
		target.value = value;
		targetsMap.set(key, target);
	}
}
