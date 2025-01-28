import {BuildingQueueElementModel} from '@warp-core/database';

export abstract class QueueElementProcessedEvent {
	constructor(public readonly queueElement: BuildingQueueElementModel) {}
}
