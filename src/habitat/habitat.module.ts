import { Module } from "@nestjs/common";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BuildingQueueModule } from "@warp-core/building-queue/building-queue.module";
import { BuildingZoneModule } from "@warp-core/building-zone/building-zone.module";
import { DatabaseModule } from "@warp-core/database/database.module";
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
    ],
    exports: [
        HabitatService,
    ]
})
export class HabitatModule {}