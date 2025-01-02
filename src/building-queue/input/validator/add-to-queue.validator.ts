import {Injectable} from '@nestjs/common';

import {AbstractNewQueueElementValidator} from '@warp-core/building-queue/input/validator/abstract-new-queue-element.validator';

@Injectable()
export class AddToQueueValidator extends AbstractNewQueueElementValidator {
	protected getEventName(): string {
		return 'building_queue.validating.add_to_queue';
	}
}
