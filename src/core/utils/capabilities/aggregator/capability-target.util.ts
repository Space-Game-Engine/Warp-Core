import {CalculatedCapabilityTargetModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilityTargetModel} from '@warp-core/database/model/capability/capability-target.model';

export type CapabilityTarget = Pick<CapabilityTargetModel, 'type' | 'value'>;

/**
 * Adds targets to the map, skipping the ones with the same type and value.
 */
export function mergeCapabilityTargets(
	targetsMap: Map<string, CapabilityTarget>,
	targets: CapabilityTarget[],
): void {
	for (const {type, value} of targets) {
		const key = `${type}|${value}`;
		if (targetsMap.has(key)) {
			continue;
		}

		targetsMap.set(key, {type, value});
	}
}

/**
 * Converts merged targets into the calculated (result) models.
 */
export function toCalculatedCapabilityTargets(
	targetsMap: Map<string, CapabilityTarget>,
): CalculatedCapabilityTargetModel[] {
	return Array.from(targetsMap.values(), ({type, value}) => {
		const target = new CalculatedCapabilityTargetModel();
		target.type = type;
		target.value = value;
		return target;
	});
}
