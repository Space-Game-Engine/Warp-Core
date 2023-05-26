import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { AuthorizedHabitatModel } from "@warp-core/auth/payload/model/habitat.model";
import { QueueElementAfterProcessingEvent } from "@warp-core/building-queue/event/queue-element-after-processing.event";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { HabitatResourceModel } from "@warp-core/database/model/habitat-resource.model";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { HabitatResourceRepository } from "@warp-core/database/repository/habitat-resource.repository";
import { DateTime } from "luxon";

@Injectable()
export class ResourceCalculatorService {

    constructor(
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly habitatResourceRepository: HabitatResourceRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
    ) {}

    async calculateSingleResource(habitatResource: HabitatResourceModel, calculationEndTime: Date = new Date()) {
        const resource = await habitatResource.resource;

        const buildingZones = await this.buildingZoneRepository.getBuildingZonesForOneResource(
            this.habitatModel,
            resource
        );

        for (const singleBuildingZone of buildingZones) {
            await this.calculateResourceForBuildingZone(habitatResource, singleBuildingZone, calculationEndTime);
        }
    }

    @OnEvent('building_queue.after_processing_element')
    async calculateAfterQueueUpdate(beforeProcessingEvent: QueueElementAfterProcessingEvent) {
        const buildingQueueElement = beforeProcessingEvent.queueElement;
        const building = await buildingQueueElement.building;
        const buildingDetails = (await building.buildingDetailsAtCertainLevel)
            .find((singleDetails) => {
                return singleDetails.level == buildingQueueElement.endLevel;
            });
        
        for (const productionRateDetails of await buildingDetails.productionRate) {
            const habitatResource =  await this.habitatResourceRepository.findOneBy({
                resourceId: productionRateDetails.resourceId,
                habitatId: this.habitatModel.id
            });

            if (!habitatResource) {
                continue;
            }

            this.calculateSingleResource(habitatResource, buildingQueueElement.endTime);
            this.habitatResourceRepository.save(habitatResource);
        }
    }

    private async calculateResourceForBuildingZone(habitatResource: HabitatResourceModel, buildingZone: BuildingZoneModel, calculationEndTime: Date) {
        const productionRate = await this.getProductionRateForSingleBuildingZone(buildingZone);
        const lastlyCalculatedAmount = habitatResource.currentAmount;
        const lastCalculationTime = DateTime.fromJSDate(habitatResource.lastCalculationTime);
        const timeUntilNowInSeconds = lastCalculationTime.diff(DateTime.fromJSDate(calculationEndTime)).as('seconds');

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