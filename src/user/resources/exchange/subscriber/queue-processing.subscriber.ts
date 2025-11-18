import {Injectable} from '@nestjs/common';

import {InternalExchangeEmitListener} from '@warp-core/core/utils/internal-exchange';
import {
	BuildingQueueNames,
	BuildingQueueProcessing,
} from '@warp-core/user/queue/building-queue';
import {QueueResourceExtractorService} from '@warp-core/user/resources/service/queue-resource-extractor.service';
import {ValidateQueueResourcesService} from '@warp-core/user/resources/service/validate-queue-resources.service';

@Injectable()
export class QueueProcessingSubscriber {
	constructor(
		private readonly validateQueueResourcesService: ValidateQueueResourcesService,
		private readonly queueExtractor: QueueResourceExtractorService,
	) {}

	@InternalExchangeEmitListener(BuildingQueueNames.BeforeAddingElement)
	public async addResourcesOnQueueUpdate(
		input: BuildingQueueProcessing,
	): Promise<void> {
		await this.validateQueueResourcesService.validate(input);
	}

	@InternalExchangeEmitListener(BuildingQueueNames.AfterAddingElement)
	public setLastCalculationTimeForNewResources(
		input: BuildingQueueProcessing,
	): Promise<void> {
		return this.queueExtractor.useResourcesOnQueueUpdate(input);
	}
}
