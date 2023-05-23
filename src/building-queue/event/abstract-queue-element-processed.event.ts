import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";

export abstract class QueueElementProcessedEvent {
    constructor(
        public readonly queueElement: BuildingQueueElementModel
    ) { }
}