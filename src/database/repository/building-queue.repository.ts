import { Injectable } from "@nestjs/common";
import { BuildingQueueElementModel, BuildingZoneModel } from "@warp-core/database/model";
import { AbstractRepository } from "@warp-core/database/repository/abstract.repository";
import { DataSource, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

@Injectable()
export class BuildingQueueRepository extends AbstractRepository<BuildingQueueElementModel> {

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

    getSingleBuildingQueueElementById(queueElementId: number): Promise<BuildingQueueElementModel | null> {
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

    getUnresolvedQueueForHabitat(habitatId: number): Promise<BuildingQueueElementModel[]> {
        return this.findBy({
            isConsumed: false,
            endTime: LessThanOrEqual(new Date()),
            buildingZone: {
                habitatId: habitatId
            },
        });
    }

    getUnresolvedQueueForSingleBuildingZone(buildingZoneId: number): Promise<BuildingQueueElementModel[]> {
        const queryBuilder = this.createQueryBuilder('buildingQueue');
        queryBuilder
            .where('buildingQueue.isConsumed = false')
            .andWhere('endTime <= :date', { date: new Date() })
            .andWhere('buildingQueue.buildingZoneId = :buildingZoneId', { buildingZoneId: buildingZoneId })

        return queryBuilder.getMany();
    }
}