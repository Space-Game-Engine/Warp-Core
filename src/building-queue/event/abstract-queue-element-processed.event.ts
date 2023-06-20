import { BuildingQueueElementModel } from "@warp-core/database";

export abstract class QueueElementProcessedEvent {
    constructor(
        public readonly queueElement: BuildingQueueElementModel,
        public readonly buildingZoneLevelBeforeUpdate: number,
        public readonly buildingZoneLevelAfterUpdate: number,
    ) { }
}