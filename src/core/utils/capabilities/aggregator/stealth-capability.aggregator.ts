import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedStealthCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Stealth levels from all sources are summed.
 */
@Injectable()
export class StealthCapabilityAggregator extends CapabilityAggregatorInterface<{
	level: number | null;
}> {
	public createState(): {level: number | null} {
		return {level: null};
	}

	public async addSource(
		state: {level: number | null},
		source: CapabilitiesModel,
	): Promise<void> {
		const stealth = await source.stealth;
		if (!stealth) {
			return;
		}

		state.level = (state.level ?? 0) + stealth.level;
	}

	public applyToResult(
		state: {level: number | null},
		result: CalculatedCapabilitiesModel,
	): void {
		if (state.level === null) {
			return;
		}

		const stealth = new CalculatedStealthCapabilityModel();
		stealth.level = state.level;
		result.stealth = stealth;
	}
}
