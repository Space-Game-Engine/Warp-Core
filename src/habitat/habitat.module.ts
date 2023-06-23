import { Module } from "@nestjs/common";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from "@warp-core/auth";
import { CreateNewHabitatService } from "@warp-core/habitat/create-new-habitat.service";
import { BuildingQueueModule } from "@warp-core/building-queue";
import { DatabaseModule } from "@warp-core/database";
import { HabitatResolver } from "@warp-core/habitat/habitat.resolver";
import { HabitatService } from "@warp-core/habitat/habitat.service";
import { ResourcesModule } from "@warp-core/resources";

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