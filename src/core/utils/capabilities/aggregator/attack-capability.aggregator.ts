import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedAttackCapabilityModel,
	CalculatedCapabilitiesModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Attacks are aggregated per target (target type and value). The first source is the base,
 * the next ones change `damage` and `cooldown` by their (possibly negative) values.
 * A target that appears only in a later source is added as a new entry.
 */
@Injectable()
export class AttackCapabilityAggregator extends CapabilityAggregatorInterface<
	Map<string, CalculatedAttackCapabilityModel>
> {
	public createState(): Map<string, CalculatedAttackCapabilityModel> {
		return new Map();
	}

	public async addSource(
		state: Map<string, CalculatedAttackCapabilityModel>,
		source: CapabilitiesModel,
	): Promise<void> {
		for (const {
			targetType,
			targetValue,
			damage,
			cooldown,
		} of (await source.attack) ?? []) {
			const key = `${targetType}|${targetValue}`;
			const existing = state.get(key);

			if (!existing) {
				const entry = new CalculatedAttackCapabilityModel();
				entry.targetType = targetType;
				entry.targetValue = targetValue;
				entry.damage = damage ?? 0;
				entry.cooldown = cooldown ?? 0;
				state.set(key, entry);
				continue;
			}

			existing.damage += damage ?? 0;
			existing.cooldown += cooldown ?? 0;
		}
	}

	public applyToResult(
		state: Map<string, CalculatedAttackCapabilityModel>,
		result: CalculatedCapabilitiesModel,
	): void {
		result.attack = Array.from(state.values());
	}
}
