import { Injectable } from "@nestjs/common";
import { PayloadDataService } from "@warp-core/auth/payload/payload-data.service";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { LessThanOrEqual } from "typeorm";

@Injectable()
export class BuildingQueueHandlerService {
    constructor(
        private readonly buildingQueueRepository: BuildingQueueRepository,
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly payloadDataService: PayloadDataService,
    ) { }

    async getQueueItemsForHabitat() {
        const userHabitat = await this.payloadDataService.getModel() as HabitatModel;

        return this.buildingQueueRepository.getCurrentBuildingQueueForHabitat(userHabitat.getAuthId());
    }

    async resolveQueue() {
        const userHabitat = await this.payloadDataService.getModel() as HabitatModel;
        const notResolvedQueueItems = await this.buildingQueueRepository.findBy({
            isConsumed: false,
            endTime: LessThanOrEqual(new Date()),
            buildingZone: {
                habitatId: userHabitat.getAuthId()
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