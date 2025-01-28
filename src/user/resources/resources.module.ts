import {Module} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {AddInstallService} from '@warp-core/core/install/add-install-service.decorator';
import {DatabaseModule} from '@warp-core/database/database.module';
import {ResourceCalculatorService} from '@warp-core/user/resources/calculate/resource-calculator.service';
import {CalculateResourceStorageService} from '@warp-core/user/resources/calculate/warehouse-storage/calculate-resource-storage.service';
import {ResourcesQueryHandler} from '@warp-core/user/resources/exchange/query/resources-query.handler';
import {ResourcesInstallService} from '@warp-core/user/resources/install/resources-install.service';
import {QueueResourceExtractorService} from '@warp-core/user/resources/queue-resource-extractor.service';
import {ResourcesResolver} from '@warp-core/user/resources/resources.resolver';
import {ResourcesService} from '@warp-core/user/resources/resources.service';
import {AddResourcesOnFirstHabitatSubscriber} from '@warp-core/user/resources/subscriber/add-resources-on-first-habitat.subscriber';
import {CreateResourcesPerHabitat} from '@warp-core/user/resources/subscriber/create-resources-per-habitat.subscriber';
import {HabitatHasNewResourceProducerSubscriber} from '@warp-core/user/resources/subscriber/habitat-has-new-resource-producer.subscriber';
import {HabitatResourceRecalculateSubscriber} from '@warp-core/user/resources/subscriber/habitat-resource-recalculate.subscriber';

@Module({
	providers: [
		CreateResourcesPerHabitat,
		HabitatResourceRecalculateSubscriber,
		HabitatHasNewResourceProducerSubscriber,
		ResourcesService,
		ResourceCalculatorService,
		QueueResourceExtractorService,
		ResourcesResolver,
		CalculateResourceStorageService,
		AddResourcesOnFirstHabitatSubscriber,
		ResourcesInstallService,
		ResourcesQueryHandler,
	],
	imports: [DatabaseModule, AuthModule, CoreConfigModule],
	exports: [ResourcesService, ResourcesInstallService],
})
@AddInstallService(ResourcesInstallService)
export class ResourcesModule {}
