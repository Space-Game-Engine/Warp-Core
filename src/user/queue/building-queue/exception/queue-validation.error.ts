import {UnprocessableEntityException} from '@nestjs/common';

import {QueueValidationErrorType} from '@warp-core/user/queue/building-queue/exception/queue-validation-error.type';

export class QueueValidationError extends UnprocessableEntityException {
	constructor(public readonly validationError: QueueValidationErrorType) {
		super(validationError, 'Queue validation error');
	}
}
