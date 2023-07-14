import { Injectable } from "@nestjs/common";
import { BuildingModel, BuildingProductionRateModel, HabitatResourceModel } from "@warp-core/database/model";
import { AbstractRepository } from "@warp-core/database/repository/abstract.repository";
import { DataSource, In } from "typeorm";

@Injectable()
export class HabitatResourceRepository extends AbstractRepository<HabitatResourceModel> {
    constructor(private dataSource: DataSource) {
        super(HabitatResourceModel, dataSource.createEntityManager());
    }

    async getHabitatResourceByBuildingAndLevel(building: BuildingModel | number, level: number, habitatId: number): Promise<HabitatResourceModel[]> {
        let buildingId: number;

        if (building instanceof BuildingModel) {
            buildingId = building.id;
        } else {
            buildingId = building;
        }

        const queryBuilder = this.createQueryBuilder('habitatResource');

        queryBuilder
            .select()
            .innerJoin(BuildingProductionRateModel, 'productionRate', 'habitatResource.resourceId = productionRate.resourceId')
            .innerJoin('productionRate.buildingDetails', 'buildingDetails')
            .where('buildingDetails.buildingId = :buildingId', { buildingId: buildingId })
            .andWhere('buildingDetails.level = :level', { level: level })
            .andWhere('habitatResource.habitatId = :habitatId', {habitatId: habitatId});

        return queryBuilder.getMany();
    }

    async getHabitatResourcesByIds(resourcesIds: string[], habitatId: number): Promise<HabitatResourceModel[]> {
        return this.findBy({
            resourceId: In(resourcesIds),
            habitatId: habitatId
        })
    }
}