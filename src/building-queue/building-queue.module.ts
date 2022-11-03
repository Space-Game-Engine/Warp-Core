import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuildingZoneModule } from "../building-zone/building-zone.module";
import { BuildingModule } from "../building/building.module";
import { BuildingQueueAddService } from "./building-queue-add.service";
import { BuildingQueueFetchService } from "./building-queue-fetch.service";
import { BuildingQueueElementModel } from "./model/building-queue-element.model";

@Module({
    providers: [
        BuildingQueueAddService,
        BuildingQueueFetchService
    ],
    imports: [
        TypeOrmModule.forFeature([BuildingQueueElementModel]),
        BuildingZoneModule,
        BuildingModule,
        ConfigModule,
    ],
    exports: [
        BuildingQueueFetchService
    ]
})
export class BuildingQueueModule {
    static entities() {
        return [BuildingQueueElementModel]
    }
}