import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {RegisterMechanic} from '@warp-core/core/utils/mechanics';
import {DatabaseModule} from '@warp-core/database/database.module';
import {BuildingQueryEmitter} from '@warp-core/global/building';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone/exchange';
import {BuildingQueueAddService} from '@warp-core/user/queue/building-queue/add/building-queue-add.service';
import {BuildingQueueDraftService} from '@warp-core/user/queue/building-queue/add/building-queue-draft.service';
import {BuildingQueueResourceConsumerInterface} from '@warp-core/user/queue/building-queue/add/calculate-resources/building-queue-resource-consumer.interface';
import {SimpleCalculationService} from '@warp-core/user/queue/building-queue/add/calculate-resources/simple-calculation.service';
import {PrepareSingleBuildingQueueElementService} from '@warp-core/user/queue/building-queue/add/prepare-single-building-queue-element.service';
import {BuildingQueueHandlerService} from '@warp-core/user/queue/building-queue/building-queue-handler.service';
import {BuildingQueueResolver} from '@warp-core/user/queue/building-queue/building-queue.resolver';
import {BuildingQueueAddEmitter} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue-add.emitter';
import {BuildingQueueProcessingEmitter} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue-processing.emitter';
import {AddToQueueValidator} from '@warp-core/user/queue/building-queue/input/validator/add-to-queue.validator';
import {ConfigurationValidator} from '@warp-core/user/queue/building-queue/input/validator/configuration.validator';
import {DraftQueueElementValidator} from '@warp-core/user/queue/building-queue/input/validator/draft-queue-element.validator';
import {EndLevelValidator} from '@warp-core/user/queue/building-queue/input/validator/end-level.validator';
import {MaxQueueCountValidator} from '@warp-core/user/queue/building-queue/input/validator/max-queue-count.validator';
import {ValidateSingleQueueElementService} from '@warp-core/user/queue/building-queue/input/validator/validate-single-queue-element.service';
import {QueueConsumerMiddleware} from '@warp-core/user/queue/building-queue/queue-consumer.middleware';

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
		AddToQueueValidator,
		DraftQueueElementValidator,
		EndLevelValidator,
		ConfigurationValidator,
		MaxQueueCountValidator,
		BuildingQueueAddEmitter,
		BuildingQueueProcessingEmitter,
		ValidateSingleQueueElementService,
		QueueConsumerMiddleware,
		SimpleCalculationService,
		RegisterMechanic.forFeature(
			BuildingQueueResourceConsumerInterface,
			'runtime.mechanics.queue.building.resourceConsumer',
		),
	],
	imports: [DatabaseModule, CoreConfigModule, AuthModule],
})
export class BuildingQueueModule implements NestModule {
	public configure(consumer: MiddlewareConsumer): void {
		consumer.apply(QueueConsumerMiddleware).forRoutes('graphql');
	}
}
