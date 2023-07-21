import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "@warp-core/auth";
import { BuildingQueueModule } from "@warp-core/building-queue";
import { BuildingModule } from "@warp-core/building";
import { DatabaseModule } from "@warp-core/database";
import { HabitatModule } from "@warp-core/habitat";
import { BuildingZoneResolver } from "./building-zone.resolver";
import { BuildingZoneService } from "./building-zone.service";
import {CoreConfigModule} from "@warp-core/core/config/core-config.module";
import {NewHabitatCreatedSubscriber} from "@warp-core/building-zone/subscriber/new-habitat-created.subscriber";

@Module({
    providers: [
        BuildingZoneService,
        BuildingZoneResolver,
        NewHabitatCreatedSubscriber,
    ],
    imports: [
        DatabaseModule,
        CoreConfigModule,
        BuildingModule,
        forwardRef(() => BuildingQueueModule),
        forwardRef(() => HabitatModule),
        AuthModule,
    ],
    exports: [
        BuildingZoneService,
    ]
})
export class BuildingZoneModule {}