import {Module} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {RegisterMechanic} from '@warp-core/core/utils/mechanics';
import {DatabaseModule} from '@warp-core/database/database.module';
import {UnitQueryEmitter} from '@warp-core/global/unit';
import {
	ValidateBuildingRequirementsService,
	ValidateResearchNodeRequirementsService,
} from '@warp-core/user/queue/core';
import {SimpleUnitCalculationService} from '@warp-core/user/queue/unit-queue/add/calculate-resources/simple-unit-calculation.service';
import {UnitQueueResourceConsumerInterface} from '@warp-core/user/queue/unit-queue/add/calculate-resources/unit-queue-resource-consumer.interface';
import {PrepareSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/add/prepare-single-unit-queue-element.service';
import {UnitQueueAddService} from '@warp-core/user/queue/unit-queue/add/unit-queue-add.service';
import {UnitQueueDraftService} from '@warp-core/user/queue/unit-queue/add/unit-queue-draft.service';
import {UnitQueueAddEmitter} from '@warp-core/user/queue/unit-queue/exchange/emit/unit-queue-add.emitter';
import {UnitQueueProcessingEmitter} from '@warp-core/user/queue/unit-queue/exchange/emit/unit-queue-processing.emitter';
import {AddUnitToQueueValidator} from '@warp-core/user/queue/unit-queue/input/validator/add-unit-to-queue.validator';
import {DraftUnitQueueElementValidator} from '@warp-core/user/queue/unit-queue/input/validator/draft-unit-queue-element.validator';
import {UnitConstructionValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-construction.validator';
import {UnitMaxQueueCountValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-max-queue-count.validator';
import {UnitRequirementsValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-requirements.validator';
import {ValidateSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/input/validator/validate-single-unit-queue-element.service';
import {UnitQueueHandlerService} from '@warp-core/user/queue/unit-queue/unit-queue-handler.service';
import {UnitQueueResolver} from '@warp-core/user/queue/unit-queue/unit-queue.resolver';
import {UnitInstanceQueryEmitter} from '@warp-core/user/unit-instance';

@Module({
	providers: [
		UnitQueryEmitter,
		UnitInstanceQueryEmitter,
		UnitQueueAddService,
		UnitQueueDraftService,
		UnitQueueHandlerService,
		PrepareSingleUnitQueueElementService,
		UnitQueueResolver,
		AddUnitToQueueValidator,
		DraftUnitQueueElementValidator,
		UnitConstructionValidator,
		UnitMaxQueueCountValidator,
		UnitRequirementsValidator,
		ValidateResearchNodeRequirementsService,
		ValidateBuildingRequirementsService,
		UnitQueueAddEmitter,
		UnitQueueProcessingEmitter,
		ValidateSingleUnitQueueElementService,
		SimpleUnitCalculationService,
		RegisterMechanic.forFeature(
			UnitQueueResourceConsumerInterface,
			'runtime.mechanics.queue.unit.resourceConsumer',
		),
	],
	imports: [DatabaseModule, CoreConfigModule, AuthModule],
	exports: [UnitQueueHandlerService],
})
export class UnitQueueModule {}
