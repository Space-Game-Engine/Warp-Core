import { Module } from "@nestjs/common";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BuildingQueueModule } from "../building-queue/building-queue.module";
import { BuildingZoneModule } from "../building-zone/building-zone.module";
import { HabitatResolver } from "./habitat.resolver";
import { HabitatService } from "./habitat.service";
import { DatabaseModule } from "../database/database.module";

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