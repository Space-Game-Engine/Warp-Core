import { Module } from "@nestjs/common";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuildingZoneModule } from "../building-zone/building-zone.module";
import { HabitatResolver } from "./habitat.resolver";
import { HabitatService } from "./habitat.service";
import { HabitatModel } from "./model/habitat.model";

@Module({
    providers: [HabitatService, HabitatResolver],
    imports: [
        BuildingZoneModule,
        EventEmitterModule,
        TypeOrmModule.forFeature([HabitatModel]),
    ],
    exports: [
        HabitatService,
    ]
})
export class HabitatModule {
    static entities() {
        return [HabitatModel]
    }
}