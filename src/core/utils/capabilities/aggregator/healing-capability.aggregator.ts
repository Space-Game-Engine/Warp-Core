import {Injectable} from '@nestjs/common';

import {mergeCapabilityTargets} from '@warp-core/core/utils/capabilities/aggregator/capability-target.util';
import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedCapabilityTargetModel,
	CalculatedHealingCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

type HealingState = {
	healing: CalculatedHealingCapabilityModel | null;
	targets: Map<string, CalculatedCapabilityTargetModel>;
};

/**
 * Works like production: the interval of the first source is kept and amounts
 * from other sources are rescaled to it. Targets are merged without duplicates.
 */
@Injectable()
export class HealingCapabilityAggregator extends CapabilityAggregatorInterface<HealingState> {
	public createState(): HealingState {
		return {healing: null, targets: new Map()};
	}

	public async addSource(
		state: HealingState,
		source: CapabilitiesModel,
	): Promise<void> {
		const healing = await source.healing;
		if (!healing) {
			return;
		}

		mergeCapabilityTargets(state.targets, await healing.targets);

		if (!state.healing) {
			const entry = new CalculatedHealingCapabilityModel();
			entry.amount = healing.amount;
			entry.interval = healing.interval;
			entry.amountPerSecond = healing.amount / healing.interval;
			state.healing = entry;
			return;
		}

		state.healing.amount +=
			(healing.amount * state.healing.interval) / healing.interval;
		state.healing.amountPerSecond =
			state.healing.amount / state.healing.interval;
	}

	public applyToResult(
		state: HealingState,
		result: CalculatedCapabilitiesModel,
	): void {
		if (!state.healing) {
			return;
		}

		state.healing.targets = Array.from(state.targets.values());
		result.healing = state.healing;
	}
}
