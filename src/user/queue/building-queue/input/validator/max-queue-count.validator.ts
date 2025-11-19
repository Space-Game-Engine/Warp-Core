import {Injectable} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/building-queue/input/validator/queue-item-validator.interface';
import {QueueInputValidation} from '@warp-core/user/queue/building-queue/input/validator/type';

@Injectable()
export class MaxQueueCountValidator implements QueueItemValidatorInterface {
	constructor(
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly runtimeConfig: RuntimeConfig,
	) {}

	public async validate({
		validationError,
		buildingZone,
	}: QueueInputValidation): Promise<void> {
		const queueCounter =
			await this.buildingQueueRepository.countActiveBuildingQueueElementsForHabitat(
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
