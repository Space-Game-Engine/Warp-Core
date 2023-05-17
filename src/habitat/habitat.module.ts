import { Module } from "@nestjs/common";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from "@warp-core/auth/auth.module";
import { BuildingQueueModule } from "@warp-core/building-queue/building-queue.module";
import { DatabaseModule } from "@warp-core/database/database.module";
import { CreateNewHabitatService } from "@warp-core/habitat/create-new-habitat.service";
import { HabitatResolver } from "@warp-core/habitat/habitat.resolver";
import { HabitatService } from "@warp-core/habitat/habitat.service";
import { ResourcesModule } from "@warp-core/resources/resources.module";

@Module({
    providers: [
        HabitatService,
        HabitatResolver,
        CreateNewHabitatService,
    ],
    imports: [
        BuildingQueueModule,
        EventEmitterModule,
        DatabaseModule,
        AuthModule,
        ResourcesModule,
    ],
    exports: [
        HabitatService,
    ]
})
export class HabitatModule {}