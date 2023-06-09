import { Module } from "@nestjs/common";
import { AuthModule } from "@warp-core/auth";
import { DatabaseModule } from "@warp-core/database";
import { CreateResourcesPerHabitat } from "@warp-core/resources/create-resources-per-habitat.service";
import { HabitatResourceRecalculateSubscriber } from "@warp-core/resources/habitat-resource-recalculate.subscriber";
import { ResourceCalculatorService } from "@warp-core/resources/resource-calculator.service";
import { ResourcesResolver } from "@warp-core/resources/resources.resolver";
import { ResourcesService } from "@warp-core/resources/resources.service";
import {QueueResourceExtractorService} from "@warp-core/resources/queue-resource-extractor.service";

@Module({
    providers: [
        CreateResourcesPerHabitat,
        HabitatResourceRecalculateSubscriber,
        ResourcesService,
        ResourceCalculatorService,
        QueueResourceExtractorService,
        ResourcesResolver,
    ],
    imports: [
        DatabaseModule,
        AuthModule,
    ],
    exports: [
        ResourcesService,
    ]
})
export class ResourcesModule { }