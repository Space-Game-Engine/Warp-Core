import { Injectable } from "@nestjs/common";
import { HabitatResourceModel } from "@warp-core/database/model";
import { AbstractRepository } from "@warp-core/database/repository/abstract.repository";
import { DataSource } from "typeorm";

@Injectable()
export class HabitatResourceRepository extends AbstractRepository<HabitatResourceModel> {
    constructor(private dataSource: DataSource) {
        super(HabitatResourceModel, dataSource.createEntityManager());
    }
}