import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

export type UnitQueueInputValidation = {
	addToQueueInput: AddUnitToQueueInput;
	unit: UnitBlueprintGlobalModel;
	validationError: QueueValidationError;
};
