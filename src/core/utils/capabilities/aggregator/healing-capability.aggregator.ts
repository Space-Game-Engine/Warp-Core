import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedHealingCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Healing is aggregated per target (target type and value). The first source is the base,
 * the next ones change `amount` and `interval` by their (possibly negative) values.
 * A target that appears only in a later source is added as a new entry.
 */
@Injectable()
export class HealingCapabilityAggregator extends CapabilityAggregatorInterface<
	Map<string, CalculatedHealingCapabilityModel>
> {
	public createState(): Map<string, CalculatedHealingCapabilityModel> {
		return new Map();
	}

	public async addSource(
		state: Map<string, CalculatedHealingCapabilityModel>,
		source: CapabilitiesModel,
	): Promise<void> {
		for (const {
			targetType,
			targetValue,
			amount,
			interval,
		} of (await source.healing) ?? []) {
			const key = `${targetType}|${targetValue}`;
			const existing = state.get(key);

			if (!existing) {
				const entry = new CalculatedHealingCapabilityModel();
				entry.targetType = targetType;
				entry.targetValue = targetValue;
				entry.amount = amount ?? 0;
				entry.interval = interval ?? 0;
				state.set(key, entry);
				continue;
			}

			existing.amount += amount ?? 0;
			existing.interval += interval ?? 0;
		}
	}

	public applyToResult(
		state: Map<string, CalculatedHealingCapabilityModel>,
		result: CalculatedCapabilitiesModel,
	): void {
		result.healing = Array.from(state.values());
	}
}
