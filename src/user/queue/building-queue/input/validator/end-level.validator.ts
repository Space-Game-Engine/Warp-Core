import {Injectable} from '@nestjs/common';

import {QueueInputValidation} from '@warp-core/user/queue/building-queue/input/validator/type';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/core';

@Injectable()
export class EndLevelValidator
	implements QueueItemValidatorInterface<QueueInputValidation>
{
	public async validate({
		addToQueueInput,
		buildingZone,
		building,
		validationError,
	}: QueueInputValidation): Promise<void> {
		if (addToQueueInput.endLevel < buildingZone.level) {
			validationError.addError(
				'endLevel',
				'End level should not be lower than existing level.',
			);
			return;
		}
		if (addToQueueInput.endLevel === buildingZone.level) {
			validationError.addError(
				'endLevel',
				'End level should not equal existing level.',
			);
			return;
		}

		const lastPossibleUpdate = (
			await building.buildingDetailsAtCertainLevel
		).at(-1);

		if (!lastPossibleUpdate) {
			validationError.addError(
				'endLevel',
				`Last possible update value for building ${building.id} does not exists`,
			);
			return;
		}

		if (addToQueueInput.endLevel > lastPossibleUpdate.details.level) {
			validationError.addError(
				'endLevel',
				'You cannot update higher than it is possible. Check Building update details.',
			);
		}
	}
}
