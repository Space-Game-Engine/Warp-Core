import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedProductionCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Production flows are grouped per resource. The first flow is the base, the next ones
 * change `amount` and `interval` by their (possibly negative) values.
 */
@Injectable()
export class ProductionCapabilityAggregator extends CapabilityAggregatorInterface<
	Map<string, CalculatedProductionCapabilityModel>
> {
	public createState(): Map<string, CalculatedProductionCapabilityModel> {
		return new Map();
	}

	public async addSource(
		state: Map<string, CalculatedProductionCapabilityModel>,
		source: CapabilitiesModel,
	): Promise<void> {
		for (const {resourceId, amount, interval} of (await source.production) ??
			[]) {
			const existingFlow = state.get(resourceId);

			if (!existingFlow) {
				const flow = new CalculatedProductionCapabilityModel();
				flow.resourceId = resourceId;
				flow.amount = amount;
				flow.interval = interval;
				state.set(resourceId, flow);
				continue;
			}

			existingFlow.amount += amount ?? 0;
			existingFlow.interval += interval ?? 0;
		}
	}

	public applyToResult(
		state: Map<string, CalculatedProductionCapabilityModel>,
		result: CalculatedCapabilitiesModel,
	): void {
		result.production = Array.from(state.values());
	}
}
