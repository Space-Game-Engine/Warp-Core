import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuildingModule } from "../building/building.module";
import { HabitatModule } from "../habitat/habitat.module";
import { BuildingZoneResolver } from "./building-zone.resolver";
import { BuildingZoneService } from "./building-zone.service";
import { BuildingZoneModel } from "./model/building-zone.model";

@Module({
    providers: [BuildingZoneService, BuildingZoneResolver],
    imports: [
        TypeOrmModule.forFeature([BuildingZoneModel]),
        ConfigModule,
        BuildingModule,
        forwardRef(() => HabitatModule),
    ],
    exports: [
        BuildingZoneService,
    ]
})
export class BuildingZoneModule {
    static entities() {
        return [BuildingZoneModel]
    }
}