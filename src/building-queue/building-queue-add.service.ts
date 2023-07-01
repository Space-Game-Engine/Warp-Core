import {ConfigService} from "@nestjs/config";
import {DateTime} from "luxon";
import {BuildingService} from "@warp-core/building";
import {Injectable} from "@nestjs/common";
import {
    BuildingModel,
    BuildingQueueElementModel,
    BuildingQueueRepository,
    BuildingZoneModel,
    BuildingZoneRepository,
    ResourceTypeEnum
} from "@warp-core/database";
import {AuthorizedHabitatModel} from "@warp-core/auth";
import {EventEmitter2} from "@nestjs/event-emitter";
import {QueueElementBeforeProcessingEvent} from "@warp-core/building-queue/event/queue-element-before-processing.event";
import {QueueElementAfterProcessingEvent} from "@warp-core/building-queue/event/queue-element-after-processing.event";
import {QueueElementCostModel} from "@warp-core/database/model/queue-element-cost.model";
import {AddToQueueInput} from "@warp-core/building-queue/input/add-to-queue.input";
import {QueueError} from "@warp-core/building-queue/exception/queue.error";

@Injectable()
export class BuildingQueueAddService {
    constructor(
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

        const resourceCost = await this.calculateResourcesCosts(addToQueueElement, buildingZone, building);

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

    private async calculateResourcesCosts(addToQueueElement: AddToQueueInput, buildingZone: BuildingZoneModel, building: BuildingModel): Promise<QueueElementCostModel[]> {
        const queueCost: QueueElementCostModel[] = [];

        const allBuildingDetails = await building.buildingDetailsAtCertainLevel;
        const buildingDetailsForUpdate = allBuildingDetails.filter((buildingDetails) => {
            return buildingDetails.level >= buildingZone.level && buildingDetails.level <=addToQueueElement.endLevel
        });

        for (const buildingDetailsForUpdateElement of buildingDetailsForUpdate) {
            const buildingUpdateCosts = await buildingDetailsForUpdateElement.requirements;

            for (const buildingUpdateCost of buildingUpdateCosts) {
                const resource = await buildingUpdateCost.resource;

                if (resource.type !== ResourceTypeEnum.CONSTRUCTION_RESOURCE) {
                    continue;
                }

                queueCost.push({
                    cost: buildingUpdateCost.cost,
                    resource: resource
                });
            }
        }

        return queueCost;
    }
}