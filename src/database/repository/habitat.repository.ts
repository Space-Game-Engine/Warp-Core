import { Injectable } from "@nestjs/common";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class HabitatRepository extends Repository<HabitatModel> {
    constructor(private dataSource: DataSource) {
        super(HabitatModel, dataSource.createEntityManager());
    }

    getHabitatById(habitatId: number): Promise<HabitatModel | null> {
        return this.findOne({
            where: {
                id: habitatId
            },
        });
    }

    getHabitatsByUserId(userId: number): Promise<HabitatModel[]> {
        return this.find({
            where: {
                userId: userId
            },
        });
    }
}