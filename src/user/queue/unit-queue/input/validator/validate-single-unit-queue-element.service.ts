import {Injectable} from '@nestjs/common';

import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitQueryEmitter} from '@warp-core/global/unit';
import {AbstractValidateQueueElementService} from '@warp-core/user/queue/core';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';
import {UnitQueueInputValidation} from '@warp-core/user/queue/unit-queue/input/validator/type';

@Injectable()
export class ValidateSingleUnitQueueElementService extends AbstractValidateQueueElementService<
	AddUnitToQueueInput,
	UnitQueueInputValidation
> {
	constructor(protected readonly unitQueryEmitter: UnitQueryEmitter) {
		super();
	}

	protected async buildValidationContext(
		addToQueueInput: AddUnitToQueueInput,
		validationError: QueueValidationError,
	): Promise<UnitQueueInputValidation> {
		const unit = await this.getUnit(addToQueueInput, validationError);

		return {
			addToQueueInput,
			unit,
			validationError,
		};
	}

	protected async getUnit(
		addToQueue: AddUnitToQueueInput,
		validationError: QueueValidationError,
	): Promise<UnitBlueprintGlobalModel> {
		const {data: unit} = await this.unitQueryEmitter.getUnitById(
			addToQueue.unitId,
		);

		if (!unit) {
			validationError.addError('unitId', 'Provided unit does not exist.');
			throw validationError;
		}

		return unit;
	}
}
