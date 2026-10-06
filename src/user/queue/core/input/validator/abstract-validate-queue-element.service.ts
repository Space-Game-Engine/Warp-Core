import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/core/input/validator/queue-item-validator.interface';

/**
 * Common flow of validating a single queue element input.
 * Entity related services build a validation context (subject of the queue,
 * its current state etc.) that is passed to provided validators.
 */
export abstract class AbstractValidateQueueElementService<
	TInput extends object,
	TValidationContext,
> {
	public async validateQueueItem(input: {
		addToQueueInput: TInput;
		validators: QueueItemValidatorInterface<TValidationContext>[];
	}): Promise<true | never> {
		const {addToQueueInput, validators} = input;
		const validationError = new QueueValidationError();

		const validationContext = await this.buildValidationContext(
			addToQueueInput,
			validationError,
		);

		await Promise.all(
			validators.map(singleValidator =>
				singleValidator.validate(validationContext),
			),
		);

		if (validationError.hasErrors()) {
			throw validationError;
		}

		return true;
	}

	protected abstract buildValidationContext(
		addToQueueInput: TInput,
		validationError: QueueValidationError,
	): Promise<TValidationContext>;
}
