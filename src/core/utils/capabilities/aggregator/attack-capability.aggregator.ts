import {Injectable} from '@nestjs/common';

import {mergeCapabilityTargets} from '@warp-core/core/utils/capabilities/aggregator/capability-target.util';
import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedAttackCapabilityModel,
	CalculatedCapabilitiesModel,
	CalculatedCapabilityTargetModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

type AttackState = {
	damage: number;
	cooldown: number | null;
	targets: Map<string, CalculatedCapabilityTargetModel>;
	found: boolean;
};

/**
 * Damage is summed, targets are merged without duplicates.
 * Cooldown is the shortest positive cooldown of all sources, so a bonus with cooldown 0
 * (meaning "no change") does not remove the cooldown.
 */
@Injectable()
export class AttackCapabilityAggregator extends CapabilityAggregatorInterface<AttackState> {
	public createState(): AttackState {
		return {damage: 0, cooldown: null, targets: new Map(), found: false};
	}

	public async addSource(
		state: AttackState,
		source: CapabilitiesModel,
	): Promise<void> {
		const attack = await source.attack;
		if (!attack) {
			return;
		}

		state.found = true;
		state.damage += attack.damage;
		if (attack.cooldown > 0) {
			state.cooldown =
				state.cooldown === null
					? attack.cooldown
					: Math.min(state.cooldown, attack.cooldown);
		}
		mergeCapabilityTargets(state.targets, await attack.targets);
	}

	public applyToResult(
		state: AttackState,
		result: CalculatedCapabilitiesModel,
	): void {
		if (!state.found) {
			return;
		}

		const attack = new CalculatedAttackCapabilityModel();
		attack.damage = state.damage;
		attack.cooldown = state.cooldown ?? 0;
		attack.targets = Array.from(state.targets.values());
		result.attack = attack;
	}
}
