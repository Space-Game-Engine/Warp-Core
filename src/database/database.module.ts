import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuildingDetailsAtCertainLevelModel } from "@warp-core/database/model/building-details-at-certain-level.model";
import { BuildingProductionRateModel } from "@warp-core/database/model/building-production-rate.model";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { HabitatResourceModel } from "@warp-core/database/model/habitat-resource.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { ResourceModel } from "@warp-core/database/model/resource.model";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { BuildingRepository } from "@warp-core/database/repository/building.repository";
import { HabitatResourceRepository } from "@warp-core/database/repository/habitat-resource.repository";
import { HabitatRepository } from "@warp-core/database/repository/habitat.repository";
import { ResourceRepository } from "@warp-core/database/repository/resource.repository";

@Module({
    providers: [
        BuildingRepository,
        BuildingZoneRepository,
        BuildingQueueRepository,
        HabitatRepository,
        HabitatResourceRepository,
        ResourceRepository,
    ],
    imports: [
        TypeOrmModule.forFeature(DatabaseModule.entities()),
    ],
    exports: [
        BuildingRepository,
        BuildingZoneRepository,
        BuildingQueueRepository,
        HabitatRepository,
        HabitatResourceRepository,
        ResourceRepository,
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
            ResourceModel,
            HabitatResourceModel,
            BuildingProductionRateModel,
        ]
    }
}