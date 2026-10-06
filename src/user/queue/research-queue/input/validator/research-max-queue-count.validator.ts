import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/core';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

@Injectable()
export class ResearchMaxQueueCountValidator
	implements QueueItemValidatorInterface<ResearchQueueInputValidation>
{
	constructor(
		private readonly researchQueueRepository: ResearchQueueRepository,
		private readonly runtimeConfig: RuntimeConfig,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async validate({
		validationError,
	}: ResearchQueueInputValidation): Promise<void> {
		const queueCounter =
			await this.researchQueueRepository.countActiveQueueElementsForHabitat(
				this.habitatModel.id,
			);
		const maxElementsInQueue =
			this.runtimeConfig.habitat.researchQueue.maxElementsInQueue;

		if (queueCounter >= maxElementsInQueue) {
			validationError.addError(
				'queueInput',
				`Max queue count (${maxElementsInQueue}) has been reached`,
			);
		}
	}
}
