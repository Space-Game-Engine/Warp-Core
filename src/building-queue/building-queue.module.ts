import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@warp-core/auth/auth.module";
import { BuildingQueueAddService } from "@warp-core/building-queue/building-queue-add.service";
import { BuildingQueueResolver } from "@warp-core/building-queue/building-queue.resolver";
import { AddToQueueValidator } from "@warp-core/building-queue/input/add-to-queue.validator";
import { BuildingZoneExistsConstraint } from "@warp-core/building-queue/input/validator/building-zone-exists.validator";
import { EndLevelIsNotLowerThanBuildingZoneConstraint } from "@warp-core/building-queue/input/validator/end-level-is-not-lower-than-building-zone.validator";
import { IsBuildingIdProvidedConstraint } from "@warp-core/building-queue/input/validator/is-building-id-provided.validator";
import { IsBuildingIdValidConstraint } from "@warp-core/building-queue/input/validator/is-building-id-valid.validator";
import { BuildingZoneModule } from "@warp-core/building-zone/building-zone.module";
import { BuildingModule } from "@warp-core/building/building.module";
import { DatabaseModule } from "@warp-core/database/database.module";
@Module({
    providers: [
        BuildingQueueAddService,
        BuildingQueueResolver,
        BuildingZoneExistsConstraint,
        IsBuildingIdProvidedConstraint,
        IsBuildingIdValidConstraint,
        EndLevelIsNotLowerThanBuildingZoneConstraint,
        AddToQueueValidator,
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