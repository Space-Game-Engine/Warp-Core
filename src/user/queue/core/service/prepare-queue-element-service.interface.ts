import {QueueElementModelInterface} from '@warp-core/core/utils';

export interface PrepareQueueElementServiceInterface<
	TInput extends object,
	TQueueElement extends QueueElementModelInterface,
> {
	/**
	 * Prepares a single, not persisted yet, queue element from user input.
	 */
	getQueueElement(addToQueueElement: TInput): Promise<TQueueElement>;
}
