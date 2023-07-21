import { Module } from "@nestjs/common";
import { AuthModule } from "@warp-core/auth";
import { DatabaseModule } from "@warp-core/database";
import { CreateResourcesPerHabitat } from "@warp-core/resources/subscriber/create-resources-per-habitat.subscriber";
import { HabitatResourceRecalculateSubscriber } from "@warp-core/resources/subscriber/habitat-resource-recalculate.subscriber";
import { ResourceCalculatorService } from "@warp-core/resources/calculate/resource-calculator.service";
import { ResourcesResolver } from "@warp-core/resources/resources.resolver";
import { ResourcesService } from "@warp-core/resources/resources.service";
import {QueueResourceExtractorService} from "@warp-core/resources/queue-resource-extractor.service";
import {CalculateResourceStorageService} from "@warp-core/resources/calculate/warehouse-storage/calculate-resource-storage.service";
import {
    HabitatHasNewResourceProducerSubscriber
} from "@warp-core/resources/subscriber/habitat-has-new-resource-producer.subscriber";
import {CoreConfigModule} from "@warp-core/core/config/core-config.module";
import {
    AddResourcesOnFirstHabitatSubscriber
} from "@warp-core/resources/subscriber/add-resources-on-first-habitat.subscriber";

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
    ],
    imports: [
        DatabaseModule,
        AuthModule,
        CoreConfigModule,
    ],
    exports: [
        ResourcesService,
    ]
})
export class ResourcesModule { }