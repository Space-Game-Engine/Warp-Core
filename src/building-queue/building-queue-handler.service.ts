import { Injectable } from "@nestjs/common";
import { AuthorizedHabitatModel } from "@warp-core/auth/payload/model/habitat.model";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { LessThanOrEqual } from "typeorm";

@Injectable()
export class BuildingQueueHandlerService {
    constructor(
        private readonly buildingQueueRepository: BuildingQueueRepository,
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
    ) { }

    async getQueueItemsForHabitat() {
        return this.buildingQueueRepository.getCurrentBuildingQueueForHabitat(this.habitatModel.id);
    }

    async resolveQueue() {
        const notResolvedQueueItems = await this.buildingQueueRepository.findBy({
            isConsumed: false,
            endTime: LessThanOrEqual(new Date()),
            buildingZone: {
                habitatId: this.habitatModel.id
            },
        });

        for (const singleQueueElement of notResolvedQueueItems) {
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

        await this.buildingZoneRepository.save(connectedBuildingZone);
        await this.buildingQueueRepository.save(queueElement);
    }
}