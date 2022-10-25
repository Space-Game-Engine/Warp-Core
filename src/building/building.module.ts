import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuildingResolver } from "./building.resolver";
import { BuildingService } from "./building.service";
import { BuildingDetailsAtCertainLevelModel } from "./model/building-details-at-certain-level.model";
import { BuildingModel } from "./model/building.model";

@Module({
    providers: [BuildingService, BuildingResolver],
    imports: [
        TypeOrmModule.forFeature([BuildingModel]),
    ],
    exports: [
        BuildingService,
    ]
})
export class BuildingModule {
    static entities() {
        return [BuildingModel, BuildingDetailsAtCertainLevelModel]
    }
}