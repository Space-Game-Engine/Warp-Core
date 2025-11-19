import {Injectable} from '@nestjs/common';

import {InternalExchangeEmitListener} from '@warp-core/core/utils/internal-exchange';
import {
	BuildingQueueNames,
	BuildingQueueProcessing,
} from '@warp-core/user/queue/building-queue';
import {QueueResourceExtractorService} from '@warp-core/user/resources/service/queue-resource-extractor.service';
import {RecalculateResourcesOnQueueUpdate} from '@warp-core/user/resources/service/recalculate-resources-on-queue-update.service';
import {ValidateQueueResourcesService} from '@warp-core/user/resources/service/validate-queue-resources.service';

@Injectable()
export class QueueProcessingSubscriber {
	constructor(
		private readonly validateQueueResourcesService: ValidateQueueResourcesService,
		private readonly queueExtractor: QueueResourceExtractorService,
		private readonly habitatHasNewResourceProducerService: RecalculateResourcesOnQueueUpdate,
	) {}

	@InternalExchangeEmitListener(BuildingQueueNames.BeforeAddingElement)
	public async validateResourcesToBeConsumedByQueue(
		input: BuildingQueueProcessing,
	): Promise<void> {
		await this.validateQueueResourcesService.validate(input);
	}

	@InternalExchangeEmitListener(BuildingQueueNames.AfterAddingElement)
	public consumeResourcesOnQueue(
		input: BuildingQueueProcessing,
	): Promise<void> {
		return this.queueExtractor.useResourcesOnQueueUpdate(input);
	}

	@InternalExchangeEmitListener(BuildingQueueNames.BeforeProcessingElement)
	public setLastCalculationTimeAfterQueueProcessing(
		input: BuildingQueueProcessing,
	): Promise<void> {
		return this.habitatHasNewResourceProducerService.updateLastCalculationDateOnHabitatResource(
			input,
		);
	}
}
