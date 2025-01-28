import {Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';

import {AuthModule} from '@warp-core/auth';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {DatabaseModule} from '@warp-core/database/database.module';
import {BuildingQueryEmitter} from '@warp-core/global/building';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone/exchange';
import {BuildingQueueAddService} from '@warp-core/user/queue/building-queue/add/building-queue-add.service';
import {BuildingQueueDraftService} from '@warp-core/user/queue/building-queue/add/building-queue-draft.service';
import {SimpleCalculationService} from '@warp-core/user/queue/building-queue/add/calculate-resources/simple-calculation.service';
import {PrepareSingleBuildingQueueElementService} from '@warp-core/user/queue/building-queue/add/prepare-single-building-queue-element.service';
import {BuildingQueueHandlerService} from '@warp-core/user/queue/building-queue/building-queue-handler.service';
import {BuildingQueueResolver} from '@warp-core/user/queue/building-queue/building-queue.resolver';
import {BuildingZoneUpdateByQueueSubscriber} from '@warp-core/user/queue/building-queue/building-zone-update-by-queue.subscriber';
import {AddToQueueValidator} from '@warp-core/user/queue/building-queue/input/validator/add-to-queue.validator';
import {ConfigurationValidator} from '@warp-core/user/queue/building-queue/input/validator/configuration.validator';
import {DraftQueueElementValidator} from '@warp-core/user/queue/building-queue/input/validator/draft-queue-element.validator';
import {EndLevelValidator} from '@warp-core/user/queue/building-queue/input/validator/end-level.validator';
import {MaxQueueCountValidator} from '@warp-core/user/queue/building-queue/input/validator/max-queue-count.validator';

@Module({
	providers: [
		BuildingQueryEmitter,
		BuildingZoneEmitter,
		BuildingQueryEmitter,
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
			useClass: SimpleCalculationService,
		},
	],
	imports: [DatabaseModule, CoreConfigModule, EventEmitterModule, AuthModule],
})
export class BuildingQueueModule {}
