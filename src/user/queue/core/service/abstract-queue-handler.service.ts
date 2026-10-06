import {Logger} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {QueueElementModelInterface} from '@warp-core/core/utils';
import {AbstractQueueElementRepository} from '@warp-core/database/repository/abstract-queue-element.repository';
import {AbstractQueueProcessingEmitter} from '@warp-core/user/queue/core/exchange/abstract-queue-processing.emitter';

/**
 * Common flow of resolving queue elements that already ended.
 * Entity related services define how a consumed queue element
 * changes the state of its subject.
 */
export abstract class AbstractQueueHandlerService<
	TQueueElement extends QueueElementModelInterface,
> {
	protected readonly logger = new Logger(this.constructor.name);

	constructor(
		protected readonly queueRepository: AbstractQueueElementRepository<TQueueElement>,
		protected readonly habitatModel: AuthorizedHabitatModel,
		protected readonly queueProcessingEmitter: AbstractQueueProcessingEmitter<TQueueElement>,
	) {}

	public getQueueItemsForHabitat(): Promise<TQueueElement[]> {
		return this.queueRepository.getCurrentQueueForHabitat(this.habitatModel.id);
	}

	public async resolveQueue(): Promise<void> {
		this.logger.debug(`Resolving queue for habitat ${this.habitatModel.id}`);
		const notResolvedQueueItems =
			await this.queueRepository.getUnresolvedQueueForHabitat(
				this.habitatModel.id,
			);

		this.logger.debug(
			`${notResolvedQueueItems.length} queue elements to process`,
		);

		for (const singleQueueElement of notResolvedQueueItems) {
			await this.processQueueElement(singleQueueElement);
		}
	}

	protected async processQueueElement(
		queueElement: TQueueElement,
	): Promise<void> {
		queueElement.isConsumed = true;

		await this.queueProcessingEmitter.beforeProcessing({queueElement});

		await this.applyQueueElement(queueElement);
		await this.queueRepository.markElementAsConsumed(queueElement);

		this.logger.debug(`Queue element ${queueElement.id} processed/consumed`);

		await this.queueProcessingEmitter.afterProcessing({queueElement});
	}

	/**
	 * Applies a consumed queue element to the subject of the queue,
	 * e.g. updates level of a building zone or a research node.
	 */
	protected abstract applyQueueElement(
		queueElement: TQueueElement,
	): Promise<void>;
}
