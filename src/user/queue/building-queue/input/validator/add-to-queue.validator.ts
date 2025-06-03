import {Injectable} from '@nestjs/common';

import {CustomValidator} from '@warp-core/core';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {ConfigurationValidator} from '@warp-core/user/queue/building-queue/input/validator/configuration.validator';
import {EndLevelValidator} from '@warp-core/user/queue/building-queue/input/validator/end-level.validator';
import {MaxQueueCountValidator} from '@warp-core/user/queue/building-queue/input/validator/max-queue-count.validator';
import {ValidateSingleQueueElementService} from '@warp-core/user/queue/building-queue/input/validator/validate-single-queue-element.service';

@Injectable()
export class AddToQueueValidator extends CustomValidator<AddToQueueInput> {
	constructor(
		private readonly validateQueueItem: ValidateSingleQueueElementService,
		private readonly configurationValidator: ConfigurationValidator,
		private readonly endLevelValidator: EndLevelValidator,
		private readonly maxQueueCount: MaxQueueCountValidator,
	) {
		super();
	}

	protected async customValidator(
		addToQueue: AddToQueueInput,
	): Promise<boolean> {
		return this.validateQueueItem.validateQueueItem({
			addToQueueInput: addToQueue,
			validators: [
				this.configurationValidator,
				this.endLevelValidator,
				this.maxQueueCount,
			],
		});
	}
}
