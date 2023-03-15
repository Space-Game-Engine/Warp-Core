import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@warp-core/auth/auth.module";
import { BuildingQueueModule } from "@warp-core/building-queue/building-queue.module";
import { BuildingModule } from "@warp-core/building/building.module";
import { DatabaseModule } from "@warp-core/database/database.module";
import { HabitatModule } from "@warp-core/habitat/habitat.module";
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