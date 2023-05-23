import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AuthorizedHabitatModel } from "@warp-core/auth/payload/model/habitat.model";
import { QueueElementAfterProcessing } from "@warp-core/building-queue/event/queue-element-after-processing.event";
import { QueueElementBeforeProcessing } from "@warp-core/building-queue/event/queue-element-before-processing.event";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";

@Injectable()
export class BuildingQueueHandlerService {
    constructor(
        private readonly buildingQueueRepository: BuildingQueueRepository,
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async getQueueItemsForHabitat() {
        return this.buildingQueueRepository.getCurrentBuildingQueueForHabitat(this.habitatModel.id);
    }

    async resolveQueue() {
        const notResolvedQueueItems = await this.buildingQueueRepository
            .getUnresolvedQueueForHabitat(this.habitatModel.id);

        await this.processMultipleQueueElements(notResolvedQueueItems);
    }

    async resolveQueueForSingleBuildingZone(buildingZone: BuildingZoneModel) {
        const notResolvedQueueItems = await this.buildingQueueRepository
            .getUnresolvedQueueForSingleBuildingZone(buildingZone.id);

        await this.processMultipleQueueElements(notResolvedQueueItems);
    }

    private async processMultipleQueueElements(queueElements: BuildingQueueElementModel[]) {
        for (const singleQueueElement of queueElements) {
            await this.processQueueElement(singleQueueElement);
        }
    }

    private async processQueueElement(queueElement: BuildingQueueElementModel) {
        const connectedBuildingZone = await queueElement.buildingZone;

        connectedBuildingZone.level = queueElement.endLevel;

        if (!connectedBuildingZone.buildingId) {
            connectedBuildingZone.buildingId = (await queueElement.building).id;
        }

        queueElement.isConsumed = true;

        await this.eventEmitter.emitAsync('building_queue.before_processing_element', new QueueElementBeforeProcessing(queueElement));

        await this.buildingZoneRepository.save(connectedBuildingZone);
        await this.buildingQueueRepository.save(queueElement);

        await this.eventEmitter.emitAsync('building_queue.after_processing_element', new QueueElementAfterProcessing(queueElement));
    }
}