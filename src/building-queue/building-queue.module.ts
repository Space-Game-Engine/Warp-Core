import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { BuildingZoneModule } from "../building-zone/building-zone.module";
import { BuildingModule } from "../building/building.module";
import { BuildingQueueAddService } from "./building-queue-add.service";
import { BuildingQueueFetchService } from "./building-queue-fetch.service";
import { BuildingQueueResolver } from "./building-queue.resolver";
import { BuildingZoneExistsConstraint } from "./input/validator/building-zone-exists.validator";
import { IsBuildingIdProvidedConstraint } from "./input/validator/is-building-id-provided.validator";
import { IsBuildingIdValidConstraint } from "./input/validator/is-building-id-valid.validator";
import { BuildingQueueElementModel } from "./model/building-queue-element.model";

@Module({
    providers: [
        BuildingQueueAddService,
        BuildingQueueFetchService,
        BuildingQueueResolver,
        BuildingZoneExistsConstraint,
        IsBuildingIdProvidedConstraint,
        IsBuildingIdValidConstraint,
    ],
    imports: [
        TypeOrmModule.forFeature([BuildingQueueElementModel]),
        BuildingZoneModule,
        BuildingModule,
        ConfigModule,
        AuthModule,
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