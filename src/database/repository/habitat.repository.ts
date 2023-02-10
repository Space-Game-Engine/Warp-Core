import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { HabitatModel } from "../model/habitat.model";

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
            loadEagerRelations: false,
        });
    }

    getHabitatsByUserId(userId: number): Promise<HabitatModel[]> {
        return this.find({
            where: {
                userId: userId
            },
            loadEagerRelations: false
        });
    }
}