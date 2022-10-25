import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import { Repository } from "typeorm";
import { BuildingModel } from "./model/building.model";

@Injectable()
export class BuildingService {
    constructor(
        @InjectRepository(BuildingModel)
        private buildingRepository: Repository<BuildingModel>,
    ) {}

    getBuildingById(buildingId: number): Promise<BuildingModel|null> {
        return this.buildingRepository.findOne({
            where: {
                id: buildingId
            },
            loadEagerRelations: true
        });
    }

    getAllBuildings(): Promise<BuildingModel[]> {
        return this.buildingRepository.find({
            loadEagerRelations: true
        });
    }

    async calculateTimeInSecondsToUpgradeBuilding(startLevel: number, endLevel: number, buildingId: number): Promise<number> {
        const building = await this.getBuildingById(buildingId);

        if (!building) {
            throw new UserInputError("Building does not exists");
        }

        let secondsToUpgrade = 0;

        if (startLevel === endLevel) {
            return secondsToUpgrade;
        }

        for (const buildingDetails of building.buildingDetailsAtCertainLevel) {
            if (buildingDetails.level <= startLevel) {
                continue;
            }

            if (buildingDetails.level > endLevel) {
                break;
            }

            secondsToUpgrade += buildingDetails.timeToUpdateBuildingInSeconds;
        }

        return secondsToUpgrade;
    }
}