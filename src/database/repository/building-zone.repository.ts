import { Injectable } from "@nestjs/common";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class BuildingZoneRepository extends Repository<BuildingZoneModel> {

    constructor(private dataSource: DataSource) {
        super(BuildingZoneModel, dataSource.createEntityManager());
    }

    async getAllBuildingZonesByHabitatId(habitatId: number) {
        const buildingZones = await this.find({
            where: {
                habitat: {
                    id: habitatId
                }
            }
        });

        return buildingZones;
    }

    async getSingleBuildingZone(counterPerHabitat: number, habitatId: number): Promise<BuildingZoneModel | null> {
        const singleBuildingZone = await this.findOne({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitat: {
                    id: habitatId
                }
            }
        });

        return singleBuildingZone;
    }

    async getSingleBuildingZoneById(buildingZoneId: number): Promise<BuildingZoneModel | null> {
        const singleBuildingZone = await this.findOne({
            where: {
                id: buildingZoneId
            }
        });

        return singleBuildingZone;
    }

    async getMaxOfCounterPerHabitat(habitatId: number): Promise<number> {
        const allBuildingZones = await this.getAllBuildingZonesByHabitatId(habitatId);
        let maxCounterValue = 0;

        for (const singleBuildingZone of allBuildingZones) {
            if (singleBuildingZone.counterPerHabitat > maxCounterValue) {
                maxCounterValue = singleBuildingZone.counterPerHabitat;
            }
        }

        return maxCounterValue;
    }

}