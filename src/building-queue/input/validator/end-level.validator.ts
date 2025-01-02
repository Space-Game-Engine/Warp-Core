import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {QueueInputValidationEvent} from '@warp-core/building-queue/event/queue-input-validation.event';
import {QueueError} from '@warp-core/building-queue/exception/queue.error';

@Injectable()
export class EndLevelValidator {
	constructor() {}

	@OnEvent('building_queue.validating.add_to_queue')
	@OnEvent('building_queue.validating.draft_queue_element')
	public async validate(
		queueValidationEvent: QueueInputValidationEvent,
	): Promise<void> {
		const addToQueue = queueValidationEvent.addToQueueInput;
		const buildingZone = queueValidationEvent.buildingZone;
		const building = queueValidationEvent.building;

		if (addToQueue.endLevel < buildingZone.level) {
			queueValidationEvent.addError(
				'endLevel',
				'End level should not be lower than existing level.',
			);
			return;
		}
		if (addToQueue.endLevel === buildingZone.level) {
			queueValidationEvent.addError(
				'endLevel',
				'End level should not equal existing level.',
			);
			return;
		}

		const lastPossibleUpdate = (
			await building.buildingDetailsAtCertainLevel
		).at(-1);

		if (!lastPossibleUpdate) {
			throw new QueueError(
				`Last possible update value for building ${building.id} does not exists`,
			);
		}

		if (addToQueue.endLevel > lastPossibleUpdate.level) {
			queueValidationEvent.addError(
				'endLevel',
				'You cannot update higher than it is possible. Check Building update details.',
			);
		}
	}
}
