import {Module} from '@nestjs/common';

import {AttackCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/attack-capability.aggregator';
import {ConstructionCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/construction-capability.aggregator';
import {DefenseCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/defense-capability.aggregator';
import {DetectionCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/detection-capability.aggregator';
import {HealingCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/healing-capability.aggregator';
import {MovementCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/movement-capability.aggregator';
import {ProductionCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/production-capability.aggregator';
import {StealthCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/stealth-capability.aggregator';
import {StorageCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/storage-capability.aggregator';
import {CAPABILITY_AGGREGATORS} from '@warp-core/core/utils/capabilities/capability-aggregators.token';
import {SumCapabilitiesService} from '@warp-core/core/utils/capabilities/sum-capabilities.service';

/**
 * To add a new kind of capability: create an aggregator, add it to `providers`
 * and to `inject` of the `CAPABILITY_AGGREGATORS` factory.
 */
@Module({
	providers: [
		ProductionCapabilityAggregator,
		StorageCapabilityAggregator,
		MovementCapabilityAggregator,
		AttackCapabilityAggregator,
		DefenseCapabilityAggregator,
		ConstructionCapabilityAggregator,
		HealingCapabilityAggregator,
		DetectionCapabilityAggregator,
		StealthCapabilityAggregator,
		{
			provide: CAPABILITY_AGGREGATORS,
			useFactory: (...aggregators: unknown[]): unknown[] => aggregators,
			inject: [
				ProductionCapabilityAggregator,
				StorageCapabilityAggregator,
				MovementCapabilityAggregator,
				AttackCapabilityAggregator,
				DefenseCapabilityAggregator,
				ConstructionCapabilityAggregator,
				HealingCapabilityAggregator,
				DetectionCapabilityAggregator,
				StealthCapabilityAggregator,
			],
		},
		SumCapabilitiesService,
	],
	exports: [SumCapabilitiesService],
})
export class SumCapabilitiesModule {}
