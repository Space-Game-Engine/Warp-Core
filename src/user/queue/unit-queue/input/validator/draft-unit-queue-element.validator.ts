import {Injectable} from '@nestjs/common';

import {CustomValidator} from '@warp-core/core';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';
import {UnitConstructionValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-construction.validator';
import {UnitRequirementsValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-requirements.validator';
import {ValidateSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/input/validator/validate-single-unit-queue-element.service';

@Injectable()
export class DraftUnitQueueElementValidator extends CustomValidator<AddUnitToQueueInput> {
	constructor(
		private readonly validateQueueItem: ValidateSingleUnitQueueElementService,
		private readonly constructionValidator: UnitConstructionValidator,
		private readonly requirementsValidator: UnitRequirementsValidator,
	) {
		super();
	}

	protected async customValidator(
		addToQueue: AddUnitToQueueInput,
	): Promise<boolean> {
		return this.validateQueueItem.validateQueueItem({
			addToQueueInput: addToQueue,
			validators: [this.constructionValidator, this.requirementsValidator],
		});
	}
}
