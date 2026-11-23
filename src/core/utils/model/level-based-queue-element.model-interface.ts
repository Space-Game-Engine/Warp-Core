import {QueueElementModelInterface} from '@warp-core/core/utils/model/queue-element.model-interface';

/**
 * Queue element that upgrades an entity (building, research node etc.) from one level to another.
 */
export interface LevelBasedQueueElementModelInterface extends QueueElementModelInterface {
	startLevel: number;
	endLevel: number;
}
