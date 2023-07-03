import {ConfigService} from "@nestjs/config";
import {DateTime} from "luxon";
import {BuildingService} from "@warp-core/building";
import { Inject, Injectable } from '@nestjs/common';
import {
    BuildingModel,
    BuildingQueueElementModel,
    BuildingQueueRepository,
    BuildingZoneModel,
    BuildingZoneRepository,
} from "@warp-core/database";
import {AuthorizedHabitatModel} from "@warp-core/auth";
import {EventEmitter2} from "@nestjs/event-emitter";
import {QueueElementBeforeProcessingEvent} from "@warp-core/building-queue/event/queue-element-before-processing.event";
import {QueueElementAfterProcessingEvent} from "@warp-core/building-queue/event/queue-element-after-processing.event";
import {AddToQueueInput} from "@warp-core/building-queue/input/add-to-queue.input";
import {
    ResourcesCalculatorInterface
} from "@warp-core/building-queue/add/calculate-resources/resources-calculator.interface";

@Injectable()
export class BuildingQueueAddService {
    constructor(
        @Inject('QUEUE_ADD_CALCULATION') private readonly calculationService: ResourcesCalculatorInterface,
        private readonly buildingQueueRepository: BuildingQueueRepository,
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly buildingService: BuildingService,
        private readonly habitatModel: AuthorizedHabitatModel,
        private readonly configService: ConfigService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async addToQueue(addToQueueElement: AddToQueueInput) {
        const draftQueueElement = await this.prepareDraftQueueElement(addToQueueElement);

        await this.eventEmitter.emitAsync('building_queue.adding.before_processing_element',
            new QueueElementBeforeProcessingEvent(
                draftQueueElement
            ));

        let queueElement: BuildingQueueElementModel;
        await this.buildingQueueRepository.transaction(async (entityManager) => {
            queueElement = await entityManager.save(BuildingQueueElementModel, draftQueueElement);

            await this.eventEmitter.emitAsync('building_queue.adding.after_processing_element',
                new QueueElementAfterProcessingEvent(
                    queueElement
                ));
        });

        return queueElement;
    }

    async prepareDraftQueueElement(addToQueueElement: AddToQueueInput): Promise<BuildingQueueElementModel> {
        const buildingZone = await this.buildingZoneRepository
            .getSingleBuildingZone(
                addToQueueElement.localBuildingZoneId,
                this.habitatModel.id
            );

        let building = await buildingZone.building;

        if (!building) {
            building = await this.buildingService.getBuildingById(addToQueueElement.buildingId);
        }

        const resourceCost = await this.calculationService.calculateResourcesCosts(addToQueueElement, buildingZone, building);

        const startTime = await this.prepareStartTimeForQueueElement(buildingZone);
        const queueElement: BuildingQueueElementModel = {
            id: null,
            buildingId:building.id,
            buildingZone: buildingZone,
            buildingZoneId: buildingZone.id,
            startTime: startTime,
            startLevel: buildingZone.level,
            endLevel: addToQueueElement.endLevel,
            endTime: new Date(),
            isConsumed: false,
            costs: resourceCost
        };

        queueElement.endTime = await this.prepareEndTimeForQueueElement(queueElement, building);

        return queueElement;
    }

    private async prepareStartTimeForQueueElement(buildingZone: BuildingZoneModel): Promise<Date> {
        const currentBuildingQueue = await this.buildingQueueRepository.getCurrentBuildingQueueForHabitat(buildingZone.habitatId);

        if (currentBuildingQueue.length === 0) {
            return new Date();
        }

        const lastBuildingQueueElement = currentBuildingQueue.at(-1)!;

        return lastBuildingQueueElement.endTime;
    }

    private async prepareEndTimeForQueueElement(queueElement: BuildingQueueElementModel, building: BuildingModel): Promise<Date> {
        const startTime = DateTime.fromJSDate(queueElement.startTime);
        const upgradeTime = await this.buildingService.calculateTimeInSecondsToUpgradeBuilding(
            queueElement.startLevel,
            queueElement.endLevel,
            building.id
        );
        const endTime = startTime.plus({ second: upgradeTime }).toJSDate();

        return endTime;
    }
}