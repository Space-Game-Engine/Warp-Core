import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedMovementCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Speeds on the same movement layer are summed.
 */
@Injectable()
export class MovementCapabilityAggregator extends CapabilityAggregatorInterface<
	Map<string, CalculatedMovementCapabilityModel>
> {
	public createState(): Map<string, CalculatedMovementCapabilityModel> {
		return new Map();
	}

	public async addSource(
		state: Map<string, CalculatedMovementCapabilityModel>,
		source: CapabilitiesModel,
	): Promise<void> {
		for (const {layer, speed} of (await source.movement) ?? []) {
			const existing = state.get(layer);

			if (!existing) {
				const entry = new CalculatedMovementCapabilityModel();
				entry.layer = layer;
				entry.speed = speed;
				state.set(layer, entry);
				continue;
			}

			existing.speed += speed;
		}
	}

	public applyToResult(
		state: Map<string, CalculatedMovementCapabilityModel>,
		result: CalculatedCapabilitiesModel,
	): void {
		result.movement = Array.from(state.values());
	}
}
