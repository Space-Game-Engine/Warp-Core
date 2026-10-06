import {DraftModelInterface} from '@warp-core/core/utils/model/draft.model-interface';
import type {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';

/**
 * Common shape of a single queue element, no matter what entity
 * (building, research node etc.) is processed by that queue.
 */
export interface QueueElementModelInterface extends DraftModelInterface {
	id?: number | null;
	startLevel: number;
	endLevel: number;
	startTime: Date;
	endTime: Date;
	isConsumed: boolean;
	costs: QueueElementCostModel[];

	/**
	 * Resolves id of a habitat that owns that queue element.
	 */
	getHabitatId(): Promise<number>;
}
