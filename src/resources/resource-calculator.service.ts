import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { AuthorizedHabitatModel } from "@warp-core/auth";
import { QueueElementProcessedEvent } from "@warp-core/building-queue";
import { BuildingZoneModel, BuildingZoneRepository, HabitatResourceModel, HabitatResourceRepository } from "@warp-core/database";
import { DisableAfterLoadEvent, EnableAfterLoadEvent } from "@warp-core/database/events";
import { DateTime } from "luxon";

@Injectable()
export class ResourceCalculatorService {
    private readonly logger = new Logger(ResourceCalculatorService.name);

    constructor(
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly habitatResourceRepository: HabitatResourceRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async calculateSingleResource(habitatResource: HabitatResourceModel, calculationEndTime: Date = new Date()) {
        const resource = await habitatResource.resource;

        this.logger.debug(`Calculate resource ${resource.id} for habitat ${this.habitatModel.id}`);

        const buildingZones = await this.buildingZoneRepository.getBuildingZonesForSingleResource(
            this.habitatModel,
            resource
        );

        for (const singleBuildingZone of buildingZones) {
            await this.calculateResourceForBuildingZone(habitatResource, singleBuildingZone, calculationEndTime);
        }

        this.logger.debug(`Resource ${resource.id} for habitat ${this.habitatModel.id} is calculated`);
    }

    @OnEvent('building_queue.after_processing_element')
    async calculateOnQueueUpdate(queueProcessingEvent: QueueElementProcessedEvent) {
        const buildingQueueElement = queueProcessingEvent.queueElement;

        this.logger.debug(`Calculating resource on queue update for building zone ${buildingQueueElement.buildingZoneId}`);
        const habitatResources = await this.habitatResourceRepository.getHabitatResourceByBuildingAndLevel(
            await buildingQueueElement.building,
            queueProcessingEvent.buildingZoneLevelBeforeUpdate
        );

        for (const singleHabitatResource of habitatResources) {
            await this.calculateSingleResource(singleHabitatResource, buildingQueueElement.endTime);
            await this.habitatResourceRepository.save(singleHabitatResource);
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