import {UnprocessableEntityException} from '@nestjs/common';

export class QueueValidationError extends UnprocessableEntityException {
	private readonly validationError: Record<string, string[]>;
	constructor() {
		const validationError = {};
		super(validationError, 'Queue validation error');

		this.validationError = validationError;
	}

	public addError(key: string, message: string): void {
		const errors = this.validationError[key] ?? [];

		errors.push(message);

		this.validationError[key] = errors;
	}

	public hasErrors(): boolean {
		return Object.keys(this.validationError).length > 0;
	}
}
