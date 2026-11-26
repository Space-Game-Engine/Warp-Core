import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedDefenseCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Armor from all sources is summed.
 */
@Injectable()
export class DefenseCapabilityAggregator extends CapabilityAggregatorInterface<{
	armor: number | null;
}> {
	public createState(): {armor: number | null} {
		return {armor: null};
	}

	public async addSource(
		state: {armor: number | null},
		source: CapabilitiesModel,
	): Promise<void> {
		const defense = await source.defense;
		if (!defense) {
			return;
		}

		state.armor = (state.armor ?? 0) + defense.armor;
	}

	public applyToResult(
		state: {armor: number | null},
		result: CalculatedCapabilitiesModel,
	): void {
		if (state.armor === null) {
			return;
		}

		const defense = new CalculatedDefenseCapabilityModel();
		defense.armor = state.armor;
		result.defense = defense;
	}
}
