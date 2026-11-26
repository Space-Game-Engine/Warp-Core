import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedStealthCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {StealthCapabilityModel} from '@warp-core/database/model/capability/stealth-capability.model';

type StealthState = {stealth: Pick<StealthCapabilityModel, 'level'> | null};

/**
 * Stealth levels from all sources are summed.
 */
@Injectable()
export class StealthCapabilityAggregator extends CapabilityAggregatorInterface<StealthState> {
	public createState(): StealthState {
		return {stealth: null};
	}

	public async addSource(
		state: StealthState,
		source: CapabilitiesModel,
	): Promise<void> {
		const stealth = await source.stealth;
		if (!stealth) {
			return;
		}

		state.stealth = {level: (state.stealth?.level ?? 0) + stealth.level};
	}

	public applyToResult(
		state: StealthState,
		result: CalculatedCapabilitiesModel,
	): void {
		if (!state.stealth) {
			return;
		}

		const stealth = new CalculatedStealthCapabilityModel();
		stealth.level = state.stealth.level;
		result.stealth = stealth;
	}
}
