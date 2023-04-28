import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@warp-core/auth/auth.module";
import { BuildingQueueAddService } from "@warp-core/building-queue/building-queue-add.service";
import { BuildingQueueHandlerService } from "@warp-core/building-queue/building-queue-handler.service";
import { BuildingQueueResolver } from "@warp-core/building-queue/building-queue.resolver";
import { AddToQueueValidator } from "@warp-core/building-queue/input/add-to-queue.validator";
import { BuildingZoneModule } from "@warp-core/building-zone/building-zone.module";
import { BuildingModule } from "@warp-core/building/building.module";
import { DatabaseModule } from "@warp-core/database/database.module";

@Module({
    providers: [
        BuildingQueueAddService,
        BuildingQueueHandlerService,
        BuildingQueueResolver,
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