import {Module} from "@nestjs/common";
import {EventEmitterModule} from "@nestjs/event-emitter";
import {AuthModule} from "@warp-core/auth";
import {BuildingQueueAddService} from "@warp-core/building-queue/add/building-queue-add.service";
import {BuildingQueueHandlerService} from "@warp-core/building-queue/building-queue-handler.service";
import {BuildingQueueResolver} from "@warp-core/building-queue/building-queue.resolver";
import {BuildingZoneUpdateByQueueSubscriber} from "@warp-core/building-queue/building-zone-update-by-queue.subscriber";
import {AddToQueueValidator} from "@warp-core/building-queue/input/validator/add-to-queue.validator";
import {BuildingZoneModule} from "@warp-core/building-zone/building-zone.module";
import {BuildingModule} from "@warp-core/building";
import {DatabaseModule} from "@warp-core/database";
import {EndLevelValidator} from "@warp-core/building-queue/input/validator/end-level.validator";
import {ConfigurationValidator} from "@warp-core/building-queue/input/validator/configuration.validator";
import {MaxQueueCountValidator} from "@warp-core/building-queue/input/validator/max-queue-count.validator";
import {SimpleCalculationService} from "@warp-core/building-queue/add/calculate-resources/simple-calculation.service";
import {BuildingQueueDraftService} from "@warp-core/building-queue/add/building-queue-draft.service";
import {
    PrepareSingleBuildingQueueElementService
} from "@warp-core/building-queue/add/prepare-single-building-queue-element.service";
import {DraftQueueElementValidator} from "@warp-core/building-queue/input/validator/draft-queue-element.validator";
import {CoreConfigModule} from "@warp-core/core/config/core-config.module";

@Module({
    providers: [
        BuildingQueueAddService,
        BuildingQueueDraftService,
        BuildingQueueHandlerService,
        PrepareSingleBuildingQueueElementService,
        BuildingQueueResolver,
        BuildingZoneUpdateByQueueSubscriber,
        AddToQueueValidator,
        DraftQueueElementValidator,
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
        CoreConfigModule,
        EventEmitterModule,
        AuthModule,
    ],
    exports: []
})
export class BuildingQueueModule {
}