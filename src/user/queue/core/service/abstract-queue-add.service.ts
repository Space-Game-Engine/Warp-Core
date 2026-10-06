import {
	ProcessAndConsumeResourcesServiceInterface,
	QueueElementModelInterface,
} from '@warp-core/core/utils';
import {AbstractQueueElementRepository} from '@warp-core/database/repository/abstract-queue-element.repository';
import {AbstractQueueAddEmitter} from '@warp-core/user/queue/core/exchange/abstract-queue-add.emitter';
import {PrepareQueueElementServiceInterface} from '@warp-core/user/queue/core/service/prepare-queue-element-service.interface';

/**
 * Common flow of adding new element to a queue:
 * prepare a draft, emit events and save it within a transaction.
 */
export abstract class AbstractQueueAddService<
	TInput extends object,
	TQueueElement extends QueueElementModelInterface,
> implements ProcessAndConsumeResourcesServiceInterface
{
	constructor(
		protected readonly prepareQueueElement: PrepareQueueElementServiceInterface<
			TInput,
			TQueueElement
		>,
		protected readonly queueRepository: AbstractQueueElementRepository<TQueueElement>,
		protected readonly queueAddEmitter: AbstractQueueAddEmitter<TQueueElement>,
	) {}

	public async saveQueueElement(
		addToQueueElement: TInput,
	): Promise<TQueueElement> {
		const draftQueueElement =
			await this.prepareQueueElement.getQueueElement(addToQueueElement);

		await this.queueAddEmitter.beforeAddingElement({
			queueElement: draftQueueElement,
		});

		await this.queueRepository.startTransaction();

		try {
			const queueElement =
				await this.queueRepository.saveQueueElement(draftQueueElement);

			await this.queueAddEmitter.afterAddingElement({queueElement});

			await this.queueRepository.commitTransaction();

			return queueElement;
		} catch (e) {
			await this.queueRepository.rollbackTransaction();
			throw e;
		}
	}
}
