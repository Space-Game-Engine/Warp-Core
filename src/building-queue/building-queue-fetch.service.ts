import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";
import { BuildingZoneModel } from "../database/model/building-zone.model";
import { BuildingQueueElementModel } from "./model/building-queue-element.model";

export class BuildingQueueFetchService {
    constructor(
        @InjectRepository(BuildingQueueElementModel)
        private readonly buildingQueueRepository: Repository<BuildingQueueElementModel>
    ) { }

    getCurrentBuildingQueueForHabitat(habitatId: number) {
        return this.buildingQueueRepository.find({
            where: {
                buildingZone: {
                    habitatId: habitatId
                },
                // endTime: MoreThanOrEqual(new Date()),
            }
        });
    }

    getCurrentBuildingQueueForBuildingZone(buildingZone: BuildingZoneModel) {
        return this.buildingQueueRepository.find({
            where: {
                buildingZone: {
                    id: buildingZone.id,

                },
                // endTime: MoreThanOrEqual(new Date()),
            }
        });
    }

    getSingleBuildingQueueElementById(queueElementId: number) {
        return this.buildingQueueRepository.findOne({
            where: {
                id: queueElementId
            }
        });
    }

    countActiveBuildingQueueElementsForHabitat(habitatId: number) {
        return this.buildingQueueRepository.count({
            where: {
                buildingZone: {
                    habitatId: habitatId
                },
                // endTime: MoreThanOrEqual(new Date()),
            }
        });
    }
}