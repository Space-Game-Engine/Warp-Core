import { Injectable } from "@nestjs/common";
import { AuthorizedHabitatModel } from "@warp-core/auth/payload/model/habitat.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { HabitatResourceModel } from "@warp-core/database/model/habitat-resource.model";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { DateTime } from "luxon";

@Injectable()
export class ResourceCalculatorService {

    constructor(
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
    ) {}

    async calculateSingleResource(habitatResource: HabitatResourceModel) {
        const resource = await habitatResource.resource;

        const buildingZones = await this.buildingZoneRepository.getBuildingZonesForOneResource(
            this.habitatModel,
            resource
        );

        for (const singleBuildingZone of buildingZones) {
            await this.calculateResourceForBuildingZone(habitatResource, singleBuildingZone);
        }
    }

    private async calculateResourceForBuildingZone(habitatResource: HabitatResourceModel, buildingZone: BuildingZoneModel) {
        const productionRate = await this.getProductionRateForSingleBuildingZone(buildingZone);
        const lastlyCalculatedAmount = habitatResource.currentAmount;
        const lastCalculationTime = DateTime.fromJSDate(habitatResource.lastCalculationTime);
        const timeUntilNowInSeconds = lastCalculationTime.diffNow('seconds').as('seconds');

        const currentAmount = lastlyCalculatedAmount + (productionRate * Math.abs(timeUntilNowInSeconds));

        habitatResource.currentAmount = Math.round(currentAmount);
    }

    private async getProductionRateForSingleBuildingZone(buildingZone: BuildingZoneModel): Promise<number> {
        const building = await buildingZone.building;
        const buildingDetailsAtCertainLevel = await building.buildingDetailsAtCertainLevel;
        const productionRateModel = await buildingDetailsAtCertainLevel[0].productionRate;
        const productionRateValue = productionRateModel[0].productionRate;

        return productionRateValue;
    }
}