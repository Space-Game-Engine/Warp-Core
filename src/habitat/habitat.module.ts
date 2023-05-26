import { Module } from "@nestjs/common";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from "@warp-core/auth/auth.module";
import { BuildingQueueModule } from "@warp-core/building-queue";
import { BuildingZoneModule } from "@warp-core/building-zone";
import { DatabaseModule } from "@warp-core/database";
import { HabitatResolver } from "@warp-core/habitat/habitat.resolver";
import { HabitatService } from "@warp-core/habitat/habitat.service";

@Module({
    providers: [
        HabitatService,
        HabitatResolver
    ],
    imports: [
        BuildingZoneModule,
        BuildingQueueModule,
        EventEmitterModule,
        DatabaseModule,
        AuthModule,
    ],
    exports: [
        HabitatService,
    ]
})
export class HabitatModule {}