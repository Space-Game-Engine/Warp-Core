import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuildingDetailsAtCertainLevelModel } from "@warp-core/database/model/building-details-at-certain-level.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { BuildingRepository } from "@warp-core/database/repository/building.repository";
import { HabitatRepository } from "@warp-core/database/repository/habitat.repository";

@Module({
    providers: [
        BuildingRepository,
        BuildingZoneRepository,
        HabitatRepository,
    ],
    imports: [
        TypeOrmModule.forFeature(DatabaseModule.entities()),
    ],
    exports: [
        BuildingRepository,
        BuildingZoneRepository,
        HabitatRepository,
    ]
})
export class DatabaseModule {
    static entities() {
        return [
            BuildingModel,
            BuildingDetailsAtCertainLevelModel,
            HabitatModel,
            BuildingZoneModel,
        ]
    }
}