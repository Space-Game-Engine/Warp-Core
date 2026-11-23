import {Inject, Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {CAPABILITY_AGGREGATORS} from '@warp-core/core/utils/capabilities/capability-aggregators.token';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Sums capabilities from multiple sources (e.g. global blueprint at certain level
 * and player blueprint bonuses) into one set of effective values.
 *
 * Every kind of capability is summed by its own {@link CapabilityAggregatorInterface}.
 */
@Injectable()
export class SumCapabilitiesService {
	constructor(
		@Inject(CAPABILITY_AGGREGATORS)
		private readonly aggregators: CapabilityAggregatorInterface<unknown>[],
	) {}

	public async sum(
		sources: (CapabilitiesModel | null | undefined)[],
	): Promise<CalculatedCapabilitiesModel> {
		const states = this.aggregators.map(aggregator => aggregator.createState());

		for (const source of sources) {
			if (!source) {
				continue;
			}

			await Promise.all(
				this.aggregators.map((aggregator, index) =>
					aggregator.addSource(states[index], source),
				),
			);
		}

		const result = new CalculatedCapabilitiesModel();
		this.aggregators.forEach((aggregator, index) =>
			aggregator.applyToResult(states[index], result),
		);

		return result;
	}
}
