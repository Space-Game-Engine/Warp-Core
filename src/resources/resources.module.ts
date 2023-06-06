import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "@warp-core/auth";
import { DatabaseModule } from "@warp-core/database";
import { HabitatModule } from "@warp-core/habitat";
import { CreateResourcesPerHabitat } from "@warp-core/resources/create-resources-per-habitat.service";
import { HabitatResourceRecalculateSubscriber } from "@warp-core/resources/habitat-resource-recalculate.subscriber";
import { ResourceCalculatorService } from "@warp-core/resources/resource-calculator.service";
import { ResourcesResolver } from "@warp-core/resources/resources.resolver";
import { ResourcesService } from "@warp-core/resources/resources.service";

@Module({
    providers: [
        CreateResourcesPerHabitat,
        HabitatResourceRecalculateSubscriber,
        ResourcesService,
        ResourceCalculatorService,
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