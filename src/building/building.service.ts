import { Injectable } from "@nestjs/common";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { BuildingRepository } from "@warp-core/database/repository/building.repository";
import { UserInputError } from "apollo-server-express";

@Injectable()
export class BuildingService {
    constructor(
        private buildingRepository: BuildingRepository,
    ) {}

    async getBuildingById(buildingId: number): Promise<BuildingModel> {
        return this.buildingRepository.getBuildingById(buildingId);
    }

    async getAllBuildings(): Promise<BuildingModel[]> {
        return this.buildingRepository.getAllBuildings();
    }

    async calculateTimeInSecondsToUpgradeBuilding(startLevel: number, endLevel: number, buildingId: number): Promise<number> {
        const building = await this.buildingRepository.getBuildingById(buildingId);

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