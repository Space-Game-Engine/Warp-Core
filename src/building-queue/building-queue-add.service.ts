import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BuildingZoneService } from "../building-zone/building-zone.service";
import { BuildingZoneModel } from "../building-zone/model/building-zone.model";
import { BuildingService } from "../building/building.service";
import { BuildingQueueFetchService } from "./building-queue-fetch.service";
import { QueueError } from "./exception/queue.error";
import { AddToQueueInput } from "./input/add-to-queue.input";
import { BuildingQueueElementModel } from "./model/building-queue-element.model";
import { DateTime } from "luxon";

export class BuildingQueueAddService {
    constructor(
        @InjectRepository(BuildingQueueElementModel)
        private readonly buildingQueueRepository: Repository<BuildingQueueElementModel>,
        private readonly buildingQueueFetch: BuildingQueueFetchService,
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingService: BuildingService,
        private readonly configService: ConfigService,
    ) { }

    async addToQueue(addToQueueElement: AddToQueueInput) {
        const queueCounter = await this.buildingQueueFetch.countActiveBuildingQueueElementsForHabitat(addToQueueElement.habitatId);
        const maxElementsInQueue = this.configService.get<number>('habitat.buildingQueue.maxElementsInQueue');

        if (queueCounter >= maxElementsInQueue) {
            throw new QueueError(`Max queue count (${maxElementsInQueue}) has been reached`);
        }

        const draftQueueElement = await this.prepareDraftQueueElement(addToQueueElement);
        
        const queueElement = this.buildingQueueRepository.create(draftQueueElement);

        return queueElement;
    }

    async prepareDraftQueueElement(addToQueueElement: AddToQueueInput): Promise<BuildingQueueElementModel> {
        const buildingZone = await this.buildingZoneService
            .getSingleBuildingZone(
                addToQueueElement.buildingZoneId,
                addToQueueElement.habitatId
            );

        if (await this.isAddToQueueValid(addToQueueElement, buildingZone) === false) {
            throw new QueueError('Queue element is not valid');
        }

        const startTime = await this.prepareStartTimeForQueueElement(buildingZone!);
        const queueElement: BuildingQueueElementModel = {
            building: buildingZone.building,
            buildingZone: buildingZone,
            startTime: startTime,
            startLevel: buildingZone!.level,
            endLevel: addToQueueElement.endLevel,
            endTime: new Date(),
            id: 0,
        };

        queueElement.endTime = await this.prepareEndTimeForQueueElement(queueElement);

        return queueElement;
    }

    private async isAddToQueueValid(addToQueueElement: AddToQueueInput, buildingZone: BuildingZoneModel | null): Promise<boolean> {
        if (!buildingZone) {
            throw new QueueError("Selected building zone not exists");
        }

        if (
            !buildingZone.buildingId &&
            !addToQueueElement.buildingId
        ) {
            throw new QueueError("First queue for selected building zone must have desired building Id");
        }

        if (this.configService.get<boolean>('habitat.buildingQueue.allowMultipleLevelUpdate') === false) {
            if (await this.isPossibleToQueueElementByOneLevel(addToQueueElement, buildingZone) === false) {
                throw new QueueError("You can update building only one level at once");
            }
        }

        return true;
    }

    private async isPossibleToQueueElementByOneLevel(addToQueueElement: AddToQueueInput, buildingZone: BuildingZoneModel): Promise<Boolean> {
        if (addToQueueElement.endLevel - 1 > buildingZone.level) {
            return false;
        }

        return true;
    }

    private async prepareStartTimeForQueueElement(buildingZone: BuildingZoneModel): Promise<Date> {
        const currentBuildingQueue = await this.buildingQueueFetch.getCurrentBuildingQueueForHabitat(buildingZone.habitatId);

        if (currentBuildingQueue.length === 0) {
            return new Date();
        }

        const lastBuildingQueueElement = currentBuildingQueue.at(-1)!;

        return lastBuildingQueueElement.endTime;
    }

    private async prepareEndTimeForQueueElement(queueElement: BuildingQueueElementModel): Promise<Date> {
        const startTime = DateTime.fromJSDate(queueElement.startTime);
        const upgradeTime = await this.buildingService.calculateTimeInSecondsToUpgradeBuilding(
            queueElement.startLevel,
            queueElement.endLevel,
            queueElement.building.id
        );
        const endTime = startTime.plus({ second: upgradeTime }).toJSDate();

        return endTime;
    }
}