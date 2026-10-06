import {QueueElementModelInterface} from '@warp-core/core/utils';
import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {QueueProcessing} from '@warp-core/user/queue/core/exchange/queue-processing.type';

/**
 * Emits events on processing (consuming) queue elements.
 * Queue for each entity type provides its own event names.
 */
export abstract class AbstractQueueProcessingEmitter<
	T extends QueueElementModelInterface,
> {
	protected abstract readonly beforeProcessingEventName: string;
	protected abstract readonly afterProcessingEventName: string;

	constructor(protected readonly emitter: InternalExchangeEmitter) {}

	public beforeProcessing(input: QueueProcessing<T>): Promise<void> {
		return this.emitter.emit({
			eventName: this.beforeProcessingEventName,
			requestData: input,
		});
	}

	public afterProcessing(input: QueueProcessing<T>): Promise<void> {
		return this.emitter.emit({
			eventName: this.afterProcessingEventName,
			requestData: input,
		});
	}
}
