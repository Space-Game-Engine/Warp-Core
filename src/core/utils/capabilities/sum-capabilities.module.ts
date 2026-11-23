import {Module} from '@nestjs/common';

import {ProductionCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/production-capability.aggregator';
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
		{
			provide: CAPABILITY_AGGREGATORS,
			useFactory: (...aggregators: unknown[]): unknown[] => aggregators,
			inject: [ProductionCapabilityAggregator, StorageCapabilityAggregator],
		},
		SumCapabilitiesService,
	],
	exports: [SumCapabilitiesService],
})
export class SumCapabilitiesModule {}
