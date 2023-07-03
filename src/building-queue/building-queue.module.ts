import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {EventEmitterModule} from "@nestjs/event-emitter";
import {AuthModule} from "@warp-core/auth";
import {BuildingQueueAddService} from "@warp-core/building-queue/add/building-queue-add.service";
import {BuildingQueueHandlerService} from "@warp-core/building-queue/building-queue-handler.service";
import {BuildingQueueResolver} from "@warp-core/building-queue/building-queue.resolver";
import {BuildingZoneUpdateByQueueSubscriber} from "@warp-core/building-queue/building-zone-update-by-queue.subscriber";
import {AddToQueueValidator} from "@warp-core/building-queue/input/validator/add-to-queue.validator";
import {BuildingZoneModule} from "@warp-core/building-zone";
import {BuildingModule} from "@warp-core/building";
import {DatabaseModule} from "@warp-core/database";
import {EndLevelValidator} from "@warp-core/building-queue/input/validator/end-level.validator";
import {ConfigurationValidator} from "@warp-core/building-queue/input/validator/configuration.validator";
import {MaxQueueCountValidator} from "@warp-core/building-queue/input/validator/max-queue-count.validator";
import {SimpleCalculationService} from "@warp-core/building-queue/add/calculate-resources/simple-calculation.service";

@Module({
    providers: [
        BuildingQueueAddService,
        BuildingQueueHandlerService,
        BuildingQueueResolver,
        BuildingZoneUpdateByQueueSubscriber,
        AddToQueueValidator,
        EndLevelValidator,
        ConfigurationValidator,
        MaxQueueCountValidator,
        {
            provide: 'QUEUE_ADD_CALCULATION',
            useClass: SimpleCalculationService
        }
    ],
    imports: [
        BuildingZoneModule,
        BuildingModule,
        DatabaseModule,
        ConfigModule,
        EventEmitterModule,
        AuthModule,
    ],
    exports: []
})
export class BuildingQueueModule {
}