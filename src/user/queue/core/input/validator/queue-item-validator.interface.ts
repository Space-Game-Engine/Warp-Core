export interface QueueItemValidatorInterface<TValidationContext> {
	validate(input: TValidationContext): Promise<void>;
}
