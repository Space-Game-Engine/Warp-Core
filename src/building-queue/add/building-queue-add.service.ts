import {Injectable} from '@nestjs/common';
import {
	BuildingQueueElementModel,
	BuildingQueueRepository,
} from '@warp-core/database';
import {EventEmitter2} from '@nestjs/event-emitter';
import {QueueElementBeforeProcessingEvent} from '@warp-core/building-queue/event/queue-element-before-processing.event';
import {QueueElementAfterProcessingEvent} from '@warp-core/building-queue/event/queue-element-after-processing.event';
import {AddToQueueInput} from '@warp-core/building-queue/input/add-to-queue.input';
import {PrepareSingleBuildingQueueElementService} from '@warp-core/building-queue/add/prepare-single-building-queue-element.service';
import {ProcessAndConsumeResourcesServiceInterface} from '@warp-core/core/utils';

@Injectable()
export class BuildingQueueAddService
	implements ProcessAndConsumeResourcesServiceInterface
{
	constructor(
		private readonly prepareQueueElement: PrepareSingleBuildingQueueElementService,
		protected readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async processAndConsumeResources(addToQueueElement: AddToQueueInput) {
		const draftQueueElement = await this.prepareQueueElement.getQueueElement(
			addToQueueElement,
		);

		await this.eventEmitter.emitAsync(
			'building_queue.adding.before_processing_element',
			new QueueElementBeforeProcessingEvent(draftQueueElement),
		);

		const [transactionId, entityManager] =
			await this.buildingQueueRepository.createSharedTransaction();

		try {
			const queueElement = await entityManager.save(
				BuildingQueueElementModel,
				draftQueueElement,
			);

			await this.eventEmitter.emitAsync(
				'building_queue.adding.after_processing_element',
				new QueueElementAfterProcessingEvent(queueElement),
				transactionId,
			);

			await this.buildingQueueRepository.commitSharedTransaction(transactionId);

			return queueElement;
		} catch (e) {
			await this.buildingQueueRepository.rollbackSharedTransaction(
				transactionId,
			);
			throw e;
		}
	}
}
