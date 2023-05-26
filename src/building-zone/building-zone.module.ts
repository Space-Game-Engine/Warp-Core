import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@warp-core/auth";
import { BuildingQueueModule } from "@warp-core/building-queue";
import { BuildingModule } from "@warp-core/building";
import { DatabaseModule } from "@warp-core/database";
import { HabitatModule } from "@warp-core/habitat";
import { BuildingZoneResolver } from "./building-zone.resolver";
import { BuildingZoneService } from "./building-zone.service";

@Module({
    providers: [
        BuildingZoneService,
        BuildingZoneResolver
    ],
    imports: [
        DatabaseModule,
        ConfigModule,
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