import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {UnitQueueRepository} from '@warp-core/database/repository/unit-queue.repository';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/core';
import {UnitQueueInputValidation} from '@warp-core/user/queue/unit-queue/input/validator/type';

@Injectable()
export class UnitMaxQueueCountValidator implements QueueItemValidatorInterface<UnitQueueInputValidation> {
	constructor(
		private readonly unitQueueRepository: UnitQueueRepository,
		private readonly runtimeConfig: RuntimeConfig,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async validate({
		validationError,
	}: UnitQueueInputValidation): Promise<void> {
		const queueCounter =
			await this.unitQueueRepository.countActiveQueueElementsForHabitat(
				this.habitatModel.id,
			);
		const maxElementsInQueue =
			this.runtimeConfig.habitat.unitQueue.maxElementsInQueue;

		if (queueCounter >= maxElementsInQueue) {
			validationError.addError(
				'queueInput',
				`Max queue count (${maxElementsInQueue}) has been reached`,
			);
		}
	}
}
