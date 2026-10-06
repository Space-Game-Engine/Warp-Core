import {Module} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {RegisterMechanic} from '@warp-core/core/utils/mechanics';
import {DatabaseModule} from '@warp-core/database/database.module';
import {ResearchNodeQueryEmitter} from '@warp-core/global/research-node';
import {ResearchQueueResourceConsumerInterface} from '@warp-core/user/queue/research-queue/add/calculate-resources/research-queue-resource-consumer.interface';
import {SimpleResearchCalculationService} from '@warp-core/user/queue/research-queue/add/calculate-resources/simple-research-calculation.service';
import {PrepareSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/add/prepare-single-research-queue-element.service';
import {ResearchQueueAddService} from '@warp-core/user/queue/research-queue/add/research-queue-add.service';
import {ResearchQueueDraftService} from '@warp-core/user/queue/research-queue/add/research-queue-draft.service';
import {ResearchQueueAddEmitter} from '@warp-core/user/queue/research-queue/exchange/emit/research-queue-add.emitter';
import {ResearchQueueProcessingEmitter} from '@warp-core/user/queue/research-queue/exchange/emit/research-queue-processing.emitter';
import {AddResearchToQueueValidator} from '@warp-core/user/queue/research-queue/input/validator/add-research-to-queue.validator';
import {DraftResearchQueueElementValidator} from '@warp-core/user/queue/research-queue/input/validator/draft-research-queue-element.validator';
import {ResearchConfigurationValidator} from '@warp-core/user/queue/research-queue/input/validator/research-configuration.validator';
import {ResearchEndLevelValidator} from '@warp-core/user/queue/research-queue/input/validator/research-end-level.validator';
import {ResearchMaxQueueCountValidator} from '@warp-core/user/queue/research-queue/input/validator/research-max-queue-count.validator';
import {ValidateSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/input/validator/validate-single-research-queue-element.service';
import {ResearchQueueHandlerService} from '@warp-core/user/queue/research-queue/research-queue-handler.service';

@Module({
	providers: [
		ResearchNodeQueryEmitter,
		ResearchQueueAddService,
		ResearchQueueDraftService,
		ResearchQueueHandlerService,
		PrepareSingleResearchQueueElementService,
		AddResearchToQueueValidator,
		DraftResearchQueueElementValidator,
		ResearchEndLevelValidator,
		ResearchConfigurationValidator,
		ResearchMaxQueueCountValidator,
		ResearchQueueAddEmitter,
		ResearchQueueProcessingEmitter,
		ValidateSingleResearchQueueElementService,
		SimpleResearchCalculationService,
		RegisterMechanic.forFeature(
			ResearchQueueResourceConsumerInterface,
			'runtime.mechanics.queue.research.resourceConsumer',
		),
	],
	imports: [DatabaseModule, CoreConfigModule, AuthModule],
	exports: [ResearchQueueHandlerService],
})
export class ResearchQueueModule {}
