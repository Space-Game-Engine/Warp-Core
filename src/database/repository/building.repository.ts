import { Injectable } from "@nestjs/common";
import { BuildingModel } from "@warp-core/database/model";
import { AbstractRepository } from "@warp-core/database/repository/abstract.repository";
import { DataSource } from "typeorm";

@Injectable()
export class BuildingRepository extends AbstractRepository<BuildingModel> {

    constructor(private dataSource: DataSource) {
        super(BuildingModel, dataSource.createEntityManager());
    }

    getBuildingById(buildingId: number): Promise<BuildingModel | null> {
        return this.findOne({
            where: {
                id: buildingId
            },
        });
    }

    getAllBuildings(): Promise<BuildingModel[]> {
        return this.find();
    }

}