import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedDefenseCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {DefenseCapabilityModel} from '@warp-core/database/model/capability/defense-capability.model';

type DefenseState = {defense: Pick<DefenseCapabilityModel, 'armor'> | null};

/**
 * Armor from all sources is summed.
 */
@Injectable()
export class DefenseCapabilityAggregator extends CapabilityAggregatorInterface<DefenseState> {
	public createState(): DefenseState {
		return {defense: null};
	}

	public async addSource(
		state: DefenseState,
		source: CapabilitiesModel,
	): Promise<void> {
		const defense = await source.defense;
		if (!defense) {
			return;
		}

		state.defense = {armor: (state.defense?.armor ?? 0) + defense.armor};
	}

	public applyToResult(
		state: DefenseState,
		result: CalculatedCapabilitiesModel,
	): void {
		if (!state.defense) {
			return;
		}

		const defense = new CalculatedDefenseCapabilityModel();
		defense.armor = state.defense.armor;
		result.defense = defense;
	}
}
