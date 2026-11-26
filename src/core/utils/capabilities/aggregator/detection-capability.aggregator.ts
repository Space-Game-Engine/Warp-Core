import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedDetectionCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {DetectionCapabilityModel} from '@warp-core/database/model/capability/detection-capability.model';

type DetectionState = {
	detection: Pick<
		DetectionCapabilityModel,
		'sightRange' | 'detectsStealth'
	> | null;
};

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
			state.detection = {
				sightRange: detection.sightRange,
				detectsStealth: detection.detectsStealth,
			};
			return;
		}

		state.detection.sightRange += detection.sightRange;
		state.detection.detectsStealth ||= detection.detectsStealth;
	}

	public applyToResult(
		state: DetectionState,
		result: CalculatedCapabilitiesModel,
	): void {
		if (!state.detection) {
			return;
		}

		const detection = new CalculatedDetectionCapabilityModel();
		detection.sightRange = state.detection.sightRange;
		detection.detectsStealth = state.detection.detectsStealth;
		result.detection = detection;
	}
}
