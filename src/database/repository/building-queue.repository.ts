import { Injectable } from "@nestjs/common";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { DataSource, MoreThanOrEqual, Repository } from "typeorm";

@Injectable()
export class BuildingQueueRepository extends Repository<BuildingQueueElementModel> {

    constructor(private dataSource: DataSource) {
        super(BuildingQueueElementModel, dataSource.createEntityManager());
    }

    getCurrentBuildingQueueForHabitat(habitatId: number): Promise<BuildingQueueElementModel[]> {
        return this.find({
            where: {
                buildingZone: {
                    habitatId: habitatId
                },
                endTime: MoreThanOrEqual(new Date()),
            }
        });
    }

    getCurrentBuildingQueueForBuildingZone(buildingZone: BuildingZoneModel): Promise<BuildingQueueElementModel[]> {
        return this.find({
            where: {
                buildingZone: {
                    id: buildingZone.id,

                },
                endTime: MoreThanOrEqual(new Date()),
            }
        });
    }

    getSingleBuildingQueueElementById(queueElementId: number): Promise<BuildingQueueElementModel|null> {
        return this.findOne({
            where: {
                id: queueElementId
            }
        });
    }

    countActiveBuildingQueueElementsForHabitat(habitatId: number): Promise<number> {
        return this.count({
            where: {
                buildingZone: {
                    habitatId: habitatId
                },
                endTime: MoreThanOrEqual(new Date()),
            }
        });
    }
}