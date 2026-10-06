import {
	PrepareDraftModelServiceInterface,
	QueueElementModelInterface,
} from '@warp-core/core/utils';
import {PrepareQueueElementServiceInterface} from '@warp-core/user/queue/core/service/prepare-queue-element-service.interface';

/**
 * Prepares a draft of a queue element to be used as a preview for a user.
 */
export abstract class AbstractQueueDraftService<
	TInput extends object,
	TQueueElement extends QueueElementModelInterface,
> implements PrepareDraftModelServiceInterface
{
	constructor(
		protected readonly prepareQueueElement: PrepareQueueElementServiceInterface<
			TInput,
			TQueueElement
		>,
	) {}

	public async getDraft(addToQueueElement: TInput): Promise<TQueueElement> {
		return this.prepareQueueElement.getQueueElement(addToQueueElement);
	}
}
