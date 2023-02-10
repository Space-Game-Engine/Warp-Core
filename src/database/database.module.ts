import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuildingDetailsAtCertainLevelModel } from "./model/building-details-at-certain-level.model";
import { BuildingModel } from "./model/building.model";
import { HabitatModel } from "./model/habitat.model";
import { BuildingRepository } from "./repository/building.repository";
import { HabitatRepository } from "./repository/habitat.repository";

@Module({
    providers: [
        BuildingRepository,
        HabitatRepository,
    ],
    imports: [
        TypeOrmModule.forFeature(DatabaseModule.entities()),
    ],
    exports: [
        BuildingRepository,
        HabitatRepository,
    ]
})
export class DatabaseModule {
    static entities() {
        return [
            BuildingModel,
            BuildingDetailsAtCertainLevelModel,
            HabitatModel,
        ]
    }
}