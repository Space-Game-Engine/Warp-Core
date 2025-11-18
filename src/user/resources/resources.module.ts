import {Module} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {AddInstallService} from '@warp-core/core/install/add-install-service.decorator';
import {RegisterMechanic} from '@warp-core/core/utils/mechanics';
import {DatabaseModule} from '@warp-core/database/database.module';
import {HabitatResourceRecalculateSubscriber} from '@warp-core/user/resources/database-subscriber/habitat-resource-recalculate.subscriber';
import {NewHabitatSubscriber} from '@warp-core/user/resources/exchange/subscriber/new-habitat.subscriber';
import {QueueProcessingSubscriber} from '@warp-core/user/resources/exchange/subscriber/queue-processing.subscriber';
import {ResourcesQuerySubscriber} from '@warp-core/user/resources/exchange/subscriber/resources-query.subscriber';
import {ResourcesInstallService} from '@warp-core/user/resources/install/resources-install.service';
import {ResourcesResolver} from '@warp-core/user/resources/resources.resolver';
import {AddResourcesOnFirstHabitatService} from '@warp-core/user/resources/service/add-resources-on-first-habitat.service';
import {CalculationMechanic} from '@warp-core/user/resources/service/calculate/resource-calculation/calculation-mechanic.interface';
import {NoDistanceSimpleMultiplyResourceCalculationMechanicService} from '@warp-core/user/resources/service/calculate/resource-calculation/no-distance-simple-multiply-resource-calculation-mechanic.service';
import {ResourceCalculatorService} from '@warp-core/user/resources/service/calculate/resource-calculator.service';
import {BaseResourceStorageService} from '@warp-core/user/resources/service/calculate/warehouse-storage/base-resource-storage.service';
import {DisabledWarehouseStorageService} from '@warp-core/user/resources/service/calculate/warehouse-storage/disabled-warehouse-storage.service';
import {WarehouseStorageCalculationMechanic} from '@warp-core/user/resources/service/calculate/warehouse-storage/warehouse-storage-calculation-mechanic.interface';
import {CreateResourcesPerHabitatService} from '@warp-core/user/resources/service/create-resources-per-habitat.service';
import {QueueResourceExtractorService} from '@warp-core/user/resources/service/queue-resource-extractor.service';
import {ResourcesService} from '@warp-core/user/resources/service/resources.service';
import {ValidateQueueResourcesService} from '@warp-core/user/resources/service/validate-queue-resources.service';

@Module({
	providers: [
		CreateResourcesPerHabitatService,
		HabitatResourceRecalculateSubscriber,
		ResourcesService,
		ResourceCalculatorService,
		QueueResourceExtractorService,
		ResourcesResolver,
		BaseResourceStorageService,
		DisabledWarehouseStorageService,
		AddResourcesOnFirstHabitatService,
		ResourcesInstallService,
		ResourcesQuerySubscriber,
		NewHabitatSubscriber,
		QueueProcessingSubscriber,
		NoDistanceSimpleMultiplyResourceCalculationMechanicService,
		ValidateQueueResourcesService,
		RegisterMechanic.forFeature(
			CalculationMechanic,
			'runtime.mechanics.resources.calculation',
		),
		RegisterMechanic.forFeature(
			WarehouseStorageCalculationMechanic,
			'runtime.mechanics.resources.warehouse',
		),
	],
	imports: [DatabaseModule, AuthModule, CoreConfigModule],
	exports: [ResourcesService, ResourcesInstallService],
})
@AddInstallService(ResourcesInstallService)
export class ResourcesModule {}
