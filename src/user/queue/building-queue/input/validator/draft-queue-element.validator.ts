import {Injectable} from '@nestjs/common';

import {CustomValidator} from '@warp-core/core';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {BuildingRequirementsValidator} from '@warp-core/user/queue/building-queue/input/validator/building-requirements.validator';
import {ConfigurationValidator} from '@warp-core/user/queue/building-queue/input/validator/configuration.validator';
import {EndLevelValidator} from '@warp-core/user/queue/building-queue/input/validator/end-level.validator';
import {ValidateSingleQueueElementService} from '@warp-core/user/queue/building-queue/input/validator/validate-single-queue-element.service';

@Injectable()
export class DraftQueueElementValidator extends CustomValidator<AddToQueueInput> {
	constructor(
		private readonly validateQueueItem: ValidateSingleQueueElementService,
		private readonly configurationValidator: ConfigurationValidator,
		private readonly endLevelValidator: EndLevelValidator,
		private readonly requirementsValidator: BuildingRequirementsValidator,
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
				this.requirementsValidator,
			],
		});
	}
}
