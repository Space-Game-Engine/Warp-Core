import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {QueueInputValidationEvent} from '@warp-core/user/queue/building-queue/event/queue-input-validation.event';

@Injectable()
export class MaxQueueCountValidator {
	constructor(
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly runtimeConfig: RuntimeConfig,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	@OnEvent('building_queue.validating.add_to_queue')
	public async validate(
		queueValidationEvent: QueueInputValidationEvent,
	): Promise<void> {
		const queueCounter =
			await this.buildingQueueRepository.countActiveBuildingQueueElementsForHabitat(
				this.habitatModel.id,
			);
		const maxElementsInQueue =
			this.runtimeConfig.habitat.buildingQueue.maxElementsInQueue;

		if (queueCounter >= maxElementsInQueue) {
			queueValidationEvent.addError(
				'queueInput',
				`Max queue count (${maxElementsInQueue}) has been reached`,
			);
		}
	}
}
