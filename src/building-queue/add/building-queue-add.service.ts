import {Injectable} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';

import {PrepareSingleBuildingQueueElementService} from '@warp-core/building-queue/add/prepare-single-building-queue-element.service';
import {QueueElementAfterProcessingEvent} from '@warp-core/building-queue/event/queue-element-after-processing.event';
import {QueueElementBeforeProcessingEvent} from '@warp-core/building-queue/event/queue-element-before-processing.event';
import {AddToQueueInput} from '@warp-core/building-queue/input/add-to-queue.input';
import {ProcessAndConsumeResourcesServiceInterface} from '@warp-core/core/utils';
import {
	BuildingQueueElementModel,
	BuildingQueueRepository,
} from '@warp-core/database';

@Injectable()
export class BuildingQueueAddService
	implements ProcessAndConsumeResourcesServiceInterface
{
	constructor(
		private readonly prepareQueueElement: PrepareSingleBuildingQueueElementService,
		protected readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly eventEmitter: EventEmitter2,
	) {}

	public async processAndConsumeResources(
		addToQueueElement: AddToQueueInput,
	): Promise<BuildingQueueElementModel> {
		const draftQueueElement =
			await this.prepareQueueElement.getQueueElement(addToQueueElement);

		await this.eventEmitter.emitAsync(
			'building_queue.adding.before_processing_element',
			new QueueElementBeforeProcessingEvent(draftQueueElement),
		);

		await this.buildingQueueRepository.startTransaction();

		try {
			const queueElement =
				await this.buildingQueueRepository.save(draftQueueElement);

			await this.eventEmitter.emitAsync(
				'building_queue.adding.after_processing_element',
				new QueueElementAfterProcessingEvent(queueElement),
			);

			await this.buildingQueueRepository.commitTransaction();

			return queueElement;
		} catch (e) {
			await this.buildingQueueRepository.rollbackTransaction();
			throw e;
		}
	}
}
