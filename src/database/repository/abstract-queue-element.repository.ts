import {Injectable} from '@nestjs/common';
import {DeepPartial} from 'typeorm';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';

import {QueueElementModelInterface} from '@warp-core/core/utils';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

/**
 * Common contract for repositories that manage queue elements.
 * Every entity that can be queued (building, research node etc.)
 * should provide its own repository extending that class.
 */
@Injectable()
export abstract class AbstractQueueElementRepository<
	T extends QueueElementModelInterface,
> extends AbstractRepository<T> {
	/**
	 * Returns all queue elements that are still in progress for a habitat.
	 */
	public abstract getCurrentQueueForHabitat(habitatId: number): Promise<T[]>;

	/**
	 * Counts queue elements that are still in progress for a habitat.
	 */
	public abstract countActiveQueueElementsForHabitat(
		habitatId: number,
	): Promise<number>;

	/**
	 * Returns queue elements that already ended but were not consumed yet.
	 */
	public abstract getUnresolvedQueueForHabitat(
		habitatId: number,
	): Promise<T[]>;

	public saveQueueElement(queueElement: T): Promise<T> {
		return this.save(queueElement as DeepPartial<T> & T);
	}

	public async markElementAsConsumed(queueElement: T): Promise<void> {
		await this.update(queueElement.id as number, {
			isConsumed: true,
		} as QueryDeepPartialEntity<T>);
	}
}
