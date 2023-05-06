import { Injectable } from "@nestjs/common";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { AbstractRepository } from "@warp-core/database/repository/abstract.repository";
import { DataSource } from "typeorm";

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

}