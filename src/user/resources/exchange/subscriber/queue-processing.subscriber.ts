import {Injectable} from '@nestjs/common';

import {InternalExchangeEmitListener} from '@warp-core/core/utils/internal-exchange';
import {
	BuildingQueueNames,
	BuildingQueueProcessing,
} from '@warp-core/user/queue/building-queue';
import {ResourceCalculatorService} from '@warp-core/user/resources/service/calculate/resource-calculator.service';
import {HabitatHasNewResourceProducerService} from '@warp-core/user/resources/service/habitat-has-new-resource-producer.service';
import {QueueResourceExtractorService} from '@warp-core/user/resources/service/queue-resource-extractor.service';

@Injectable()
export class QueueProcessingSubscriber {
	constructor(
		private readonly resourceCalculatorService: ResourceCalculatorService,
		private readonly newResourcesProducer: HabitatHasNewResourceProducerService,
		private readonly queueExtractor: QueueResourceExtractorService,
	) {}

	@InternalExchangeEmitListener(BuildingQueueNames.BeforeAddingElement)
	public addResourcesOnQueueUpdate(
		input: BuildingQueueProcessing,
	): Promise<void> {
		return Promise.allSettled([
			this.resourceCalculatorService.addResourcesOnQueueUpdate(input),
			this.newResourcesProducer.updateLastCalculationDateOnHabitatResource(
				input,
			),
		]).then();
	}

	@InternalExchangeEmitListener(BuildingQueueNames.AfterAddingElement)
	public setLastCalculationTimeForNewResources(
		input: BuildingQueueProcessing,
	): Promise<void> {
		return Promise.allSettled([
			this.queueExtractor.useResourcesOnQueueUpdate(input),
		]).then();
	}
}
