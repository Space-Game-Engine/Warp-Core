import { Injectable } from "@nestjs/common";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { ResourceModel } from "@warp-core/database/model/resource.model";
import { AbstractRepository } from "@warp-core/database/repository/abstract.repository";
import { DataSource, FindOptionsUtils } from "typeorm";

@Injectable()
export class BuildingZoneRepository extends AbstractRepository<BuildingZoneModel> {

    constructor(private dataSource: DataSource) {
        super(BuildingZoneModel, dataSource.createEntityManager());
    }

    async getAllBuildingZonesByHabitatId(habitatId: number): Promise<BuildingZoneModel[]> {
        const buildingZones = await this.find({
            where: {
                habitat: {
                    id: habitatId
                }
            }
        });

        return buildingZones;
    }

    async getSingleBuildingZone(localBuildingZoneId: number, habitatId: number): Promise<BuildingZoneModel | null> {
        const singleBuildingZone = await this.findOne({
            where: {
                localBuildingZoneId: localBuildingZoneId,
                habitat: {
                    id: habitatId
                }
            }
        });

        return singleBuildingZone;
    }

    async getSingleBuildingZoneById(id: number): Promise<BuildingZoneModel | null> {
        const singleBuildingZone = await this.findOne({
            where: {
                id: id
            }
        });

        return singleBuildingZone;
    }

    async getMaxOfCounterPerHabitat(habitatId: number): Promise<number> {
        const allBuildingZones = await this.getAllBuildingZonesByHabitatId(habitatId);
        let maxCounterValue = 0;

        for (const singleBuildingZone of allBuildingZones) {
            if (singleBuildingZone.localBuildingZoneId > maxCounterValue) {
                maxCounterValue = singleBuildingZone.localBuildingZoneId;
            }
        }

        return maxCounterValue;
    }

    async getBuildingZonesForOneResource(habitat: HabitatModel, resourceType: ResourceModel): Promise<BuildingZoneModel[]>  {
        const queryBuilder = await this.createQueryBuilder("buildingZone");
        FindOptionsUtils.joinEagerRelations(queryBuilder, "buildingZone", this.metadata);
        queryBuilder
            .select()
            .innerJoinAndSelect('buildingZone.building', 'building')
            .innerJoinAndSelect('building.buildingDetailsAtCertainLevel', 'details', 'buildingZone.level = details.level')
            .innerJoinAndSelect('details.productionRate', 'productionRate')
            .where("buildingZone.habitatId = :habitatId", { habitatId : habitat.id})
            .andWhere('productionRate.resourceId = :resourceId', { resourceId : resourceType.id})
            .getMany();

        return queryBuilder.getMany();
    }

}