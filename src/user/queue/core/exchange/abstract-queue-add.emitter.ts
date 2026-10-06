import {QueueElementModelInterface} from '@warp-core/core/utils';
import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {QueueProcessing} from '@warp-core/user/queue/core/exchange/queue-processing.type';

/**
 * Emits events on adding new element to a queue.
 * Queue for each entity type provides its own event names.
 */
export abstract class AbstractQueueAddEmitter<
	T extends QueueElementModelInterface,
> {
	protected abstract readonly beforeAddingEventName: string;
	protected abstract readonly afterAddingEventName: string;

	constructor(protected readonly emitter: InternalExchangeEmitter) {}

	public beforeAddingElement(input: QueueProcessing<T>): Promise<void> {
		return this.emitter.emit({
			eventName: this.beforeAddingEventName,
			requestData: input,
		});
	}

	public afterAddingElement(input: QueueProcessing<T>): Promise<void> {
		return this.emitter.emit({
			eventName: this.afterAddingEventName,
			requestData: input,
		});
	}
}
