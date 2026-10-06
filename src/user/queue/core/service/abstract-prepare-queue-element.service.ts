import {DateTime} from 'luxon';

import {QueueElementModelInterface} from '@warp-core/core/utils';
import {AbstractQueueElementRepository} from '@warp-core/database/repository/abstract-queue-element.repository';
import {PrepareQueueElementServiceInterface} from '@warp-core/user/queue/core/service/prepare-queue-element-service.interface';

/**
 * Common flow of preparing a single queue element.
 * Entity related services provide a draft with costs and levels,
 * while this class manages start and end time of a queue element.
 */
export abstract class AbstractPrepareQueueElementService<
	TInput extends object,
	TQueueElement extends QueueElementModelInterface,
> implements PrepareQueueElementServiceInterface<TInput, TQueueElement>
{
	constructor(
		protected readonly queueRepository: AbstractQueueElementRepository<TQueueElement>,
	) {}

	public async getQueueElement(
		addToQueueElement: TInput,
	): Promise<TQueueElement> {
		const queueElement = await this.createDraftQueueElement(addToQueueElement);

		queueElement.startTime = await this.prepareStartTimeForQueueElement(
			await queueElement.getHabitatId(),
		);
		queueElement.endTime =
			await this.prepareEndTimeForQueueElement(queueElement);

		return queueElement;
	}

	/**
	 * Creates a draft queue element with subject of the queue,
	 * levels to process and calculated costs.
	 */
	protected abstract createDraftQueueElement(
		addToQueueElement: TInput,
	): Promise<TQueueElement>;

	/**
	 * Calculates how long it takes to process provided queue element.
	 */
	protected abstract calculateUpgradeTimeInSeconds(
		queueElement: TQueueElement,
	): Promise<number>;

	protected async prepareStartTimeForQueueElement(
		habitatId: number,
	): Promise<Date> {
		const currentQueue =
			await this.queueRepository.getCurrentQueueForHabitat(habitatId);

		if (currentQueue.length === 0) {
			return new Date();
		}

		const lastQueueElement = currentQueue.at(-1)!;

		return lastQueueElement.endTime;
	}

	protected async prepareEndTimeForQueueElement(
		queueElement: TQueueElement,
	): Promise<Date> {
		const startTime = DateTime.fromJSDate(queueElement.startTime);
		const upgradeTime = await this.calculateUpgradeTimeInSeconds(queueElement);

		return startTime.plus({second: upgradeTime}).toUTC().toJSDate();
	}
}
