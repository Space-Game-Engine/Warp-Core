import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedDetectionCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

type DetectionState = {detection: CalculatedDetectionCapabilityModel | null};

/**
 * Sight range is summed. Stealth detection is enabled when any source enables it.
 */
@Injectable()
export class DetectionCapabilityAggregator extends CapabilityAggregatorInterface<DetectionState> {
	public createState(): DetectionState {
		return {detection: null};
	}

	public async addSource(
		state: DetectionState,
		source: CapabilitiesModel,
	): Promise<void> {
		const detection = await source.detection;
		if (!detection) {
			return;
		}

		if (!state.detection) {
			const entry = new CalculatedDetectionCapabilityModel();
			entry.sightRange = detection.sightRange;
			entry.detectsStealth = detection.detectsStealth;
			state.detection = entry;
			return;
		}

		state.detection.sightRange += detection.sightRange;
		state.detection.detectsStealth ||= detection.detectsStealth;
	}

	public applyToResult(
		state: DetectionState,
		result: CalculatedCapabilitiesModel,
	): void {
		result.detection = state.detection;
	}
}
