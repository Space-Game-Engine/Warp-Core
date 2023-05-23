import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";

export abstract class QueueElementProcessed {
    constructor(
        public readonly queueElement: BuildingQueueElementModel
    ) { }
}