import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@warp-core/database/database.module";
import { AuthModule } from "../auth/auth.module";
import { BuildingZoneModule } from "../building-zone/building-zone.module";
import { BuildingModule } from "../building/building.module";
import { BuildingQueueAddService } from "./building-queue-add.service";
import { BuildingQueueResolver } from "./building-queue.resolver";
import { BuildingZoneExistsConstraint } from "./input/validator/building-zone-exists.validator";
import { IsBuildingIdProvidedConstraint } from "./input/validator/is-building-id-provided.validator";
import { IsBuildingIdValidConstraint } from "./input/validator/is-building-id-valid.validator";

@Module({
    providers: [
        BuildingQueueAddService,
        BuildingQueueResolver,
        BuildingZoneExistsConstraint,
        IsBuildingIdProvidedConstraint,
        IsBuildingIdValidConstraint,
    ],
    imports: [
        BuildingZoneModule,
        BuildingModule,
        DatabaseModule,
        ConfigModule,
        AuthModule,
    ],
    exports: [
    ]
})
export class BuildingQueueModule {
}