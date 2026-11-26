import {Injectable} from '@nestjs/common';

import {
	CapabilityTarget,
	mergeCapabilityTargets,
	toCalculatedCapabilityTargets,
} from '@warp-core/core/utils/capabilities/aggregator/capability-target.util';
import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedHealingCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {HealingCapabilityModel} from '@warp-core/database/model/capability/healing-capability.model';

type HealingState = {
	healing: Pick<HealingCapabilityModel, 'amount' | 'interval'> | null;
	targets: Map<string, CapabilityTarget>;
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
			state.healing = {amount: healing.amount, interval: healing.interval};
			return;
		}

		state.healing.amount +=
			(healing.amount * state.healing.interval) / healing.interval;
	}

	public applyToResult(
		state: HealingState,
		result: CalculatedCapabilitiesModel,
	): void {
		if (!state.healing) {
			return;
		}

		const healing = new CalculatedHealingCapabilityModel();
		healing.amount = state.healing.amount;
		healing.interval = state.healing.interval;
		healing.targets = toCalculatedCapabilityTargets(state.targets);
		result.healing = healing;
	}
}
