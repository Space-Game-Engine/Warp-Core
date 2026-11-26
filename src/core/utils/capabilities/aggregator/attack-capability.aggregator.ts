import {Injectable} from '@nestjs/common';

import {
	CapabilityTarget,
	mergeCapabilityTargets,
	toCalculatedCapabilityTargets,
} from '@warp-core/core/utils/capabilities/aggregator/capability-target.util';
import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {AttackCapabilityModel} from '@warp-core/database/model/capability/attack-capability.model';
import {
	CalculatedAttackCapabilityModel,
	CalculatedCapabilitiesModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

type AttackState = {
	attack: Pick<AttackCapabilityModel, 'damage' | 'cooldown'> | null;
	targets: Map<string, CapabilityTarget>;
};

/**
 * Damage is summed, targets are merged without duplicates.
 * Cooldown is the shortest positive cooldown of all sources, so a bonus with cooldown 0
 * (meaning "no change") does not remove the cooldown.
 */
@Injectable()
export class AttackCapabilityAggregator extends CapabilityAggregatorInterface<AttackState> {
	public createState(): AttackState {
		return {attack: null, targets: new Map()};
	}

	public async addSource(
		state: AttackState,
		source: CapabilitiesModel,
	): Promise<void> {
		const attack = await source.attack;
		if (!attack) {
			return;
		}

		const current = state.attack ?? {damage: 0, cooldown: 0};
		state.attack = {
			damage: current.damage + attack.damage,
			cooldown:
				attack.cooldown > 0 && current.cooldown > 0
					? Math.min(current.cooldown, attack.cooldown)
					: Math.max(current.cooldown, attack.cooldown),
		};
		mergeCapabilityTargets(state.targets, await attack.targets);
	}

	public applyToResult(
		state: AttackState,
		result: CalculatedCapabilitiesModel,
	): void {
		if (!state.attack) {
			return;
		}

		const attack = new CalculatedAttackCapabilityModel();
		attack.damage = state.attack.damage;
		attack.cooldown = state.attack.cooldown;
		attack.targets = toCalculatedCapabilityTargets(state.targets);
		result.attack = attack;
	}
}
