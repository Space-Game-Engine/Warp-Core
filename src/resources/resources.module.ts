import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "@warp-core/auth/auth.module";
import { DatabaseModule } from "@warp-core/database/database.module";
import { HabitatModule } from "@warp-core/habitat/habitat.module";
import { CreateResourcesPerHabitat } from "@warp-core/resources/create-resources-per-habitat.service";
import { HabitatResourceRecalculateSubscriber } from "@warp-core/resources/habitat-resource-recalculate.subscriber";
import { ResourcesResolver } from "@warp-core/resources/resources.resolver";
import { ResourcesService } from "@warp-core/resources/resources.service";

@Module({
    providers: [
        CreateResourcesPerHabitat,
        HabitatResourceRecalculateSubscriber,
        ResourcesService,
        ResourcesResolver,
    ],
    imports: [
        DatabaseModule,
        AuthModule,
        forwardRef(() => HabitatModule),
    ],
    exports: [
        ResourcesService,
    ]
})
export class ResourcesModule { }