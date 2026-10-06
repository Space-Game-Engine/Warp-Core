import {Injectable} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {QueueInputValidation} from '@warp-core/user/queue/building-queue/input/validator/type';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/core';

@Injectable()
export class MaxQueueCountValidator
	implements QueueItemValidatorInterface<QueueInputValidation>
{
	constructor(
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly runtimeConfig: RuntimeConfig,
	) {}

	public async validate({
		validationError,
		buildingZone,
	}: QueueInputValidation): Promise<void> {
		const queueCounter =
			await this.buildingQueueRepository.countActiveQueueElementsForHabitat(
				buildingZone.habitatId,
			);
		const maxElementsInQueue =
			this.runtimeConfig.habitat.buildingQueue.maxElementsInQueue;

		if (queueCounter >= maxElementsInQueue) {
			validationError.addError(
				'queueInput',
				`Max queue count (${maxElementsInQueue}) has been reached`,
			);
		}
	}
}
