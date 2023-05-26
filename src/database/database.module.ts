import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuildingDetailsAtCertainLevelModel, BuildingModel, BuildingQueueElementModel, BuildingZoneModel, HabitatModel } from "@warp-core/database/model";
import { BuildingQueueRepository, BuildingRepository, BuildingZoneRepository, HabitatRepository } from "@warp-core/database/repository";

@Module({
    providers: [
        BuildingRepository,
        BuildingZoneRepository,
        BuildingQueueRepository,
        HabitatRepository,
    ],
    imports: [
        TypeOrmModule.forFeature(DatabaseModule.entities()),
    ],
    exports: [
        BuildingRepository,
        BuildingZoneRepository,
        BuildingQueueRepository,
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
            BuildingQueueElementModel,
        ]
    }
}