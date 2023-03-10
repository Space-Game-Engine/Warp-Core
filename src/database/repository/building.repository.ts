import { Injectable } from "@nestjs/common";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class BuildingRepository extends Repository<BuildingModel> {

    constructor(private dataSource: DataSource) {
        super(BuildingModel, dataSource.createEntityManager());
    }

    getBuildingById(buildingId: number): Promise<BuildingModel | null> {
        return this.findOne({
            where: {
                id: buildingId
            },
            loadEagerRelations: true
        });
    }

    getAllBuildings(): Promise<BuildingModel[]> {
        return this.find({
            loadEagerRelations: true
        });
    }

}