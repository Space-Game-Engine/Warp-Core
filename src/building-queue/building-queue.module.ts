import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "@warp-core/auth";
import { BuildingQueueAddService } from "@warp-core/building-queue/building-queue-add.service";
import { BuildingQueueHandlerService } from "@warp-core/building-queue/building-queue-handler.service";
import { BuildingQueueResolver } from "@warp-core/building-queue/building-queue.resolver";
import { BuildingZoneUpdateByQueueSubscriber } from "@warp-core/building-queue/building-zone-update-by-queue.subscriber";
import { AddToQueueValidator } from "@warp-core/building-queue/input/add-to-queue.validator";
import { BuildingZoneModule } from "@warp-core/building-zone";
import { BuildingModule } from "@warp-core/building";
import { DatabaseModule } from "@warp-core/database";

@Module({
    providers: [
        BuildingQueueAddService,
        BuildingQueueHandlerService,
        BuildingQueueResolver,
        AddToQueueValidator,
        BuildingZoneUpdateByQueueSubscriber,
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