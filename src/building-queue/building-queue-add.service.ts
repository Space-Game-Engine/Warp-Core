import { ConfigService } from "@nestjs/config";
import { QueueError } from "./exception/queue.error";
import { AddToQueueInput } from "./input/add-to-queue.input";
import { DateTime } from "luxon";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { BuildingService } from "@warp-core/building/building.service";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { PayloadDataService } from "@warp-core/auth/payload/payload-data.service";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { Injectable } from "@nestjs/common";
import { BuildingModel } from "@warp-core/database/model/building.model";

@Injectable()
export class BuildingQueueAddService {
    constructor(
        private readonly buildingQueueRepository: BuildingQueueRepository,
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly buildingService: BuildingService,
        private readonly payloadDataService: PayloadDataService,
        private readonly configService: ConfigService,
    ) { }

    async addToQueue(addToQueueElement: AddToQueueInput) {
        const userHabitat = await this.payloadDataService.getModel() as HabitatModel;

        const queueCounter = await this.buildingQueueRepository.countActiveBuildingQueueElementsForHabitat(userHabitat.id);
        const maxElementsInQueue = this.configService.get<number>('habitat.buildingQueue.maxElementsInQueue');

        if (queueCounter >= maxElementsInQueue) {
            throw new QueueError(`Max queue count (${maxElementsInQueue}) has been reached`);
        }

        const draftQueueElement = await this.prepareDraftQueueElement(addToQueueElement, userHabitat);

        const queueElement = await this.buildingQueueRepository.save(draftQueueElement);

        return queueElement;
    }

    async prepareDraftQueueElement(addToQueueElement: AddToQueueInput, userHabitat: HabitatModel): Promise<BuildingQueueElementModel> {
        const buildingZone = await this.buildingZoneRepository
            .getSingleBuildingZone(
                addToQueueElement.localBuildingZoneId,
                userHabitat.id
            );

        if (await this.isAddToQueueValid(addToQueueElement, buildingZone) === false) {
            throw new QueueError('Queue element is not valid');
        }

        let building = await buildingZone.building;

        if (!building) {
            building = await this.buildingService.getBuildingById(addToQueueElement.buildingId);
        }

        const startTime = await this.prepareStartTimeForQueueElement(buildingZone!);
        const queueElement: BuildingQueueElementModel = {
            id: null,
            buildingId:building.id,
            buildingZone: buildingZone,
            buildingZoneId: buildingZone.id,
            startTime: startTime,
            startLevel: buildingZone!.level,
            endLevel: addToQueueElement.endLevel,
            endTime: new Date(),
            isConsumed: false,
        };

        queueElement.endTime = await this.prepareEndTimeForQueueElement(queueElement, building);

        return queueElement;
    }

    private async isAddToQueueValid(addToQueueElement: AddToQueueInput, buildingZone: BuildingZoneModel | null): Promise<boolean> {

        if (this.configService.get<boolean>('habitat.buildingQueue.allowMultipleLevelUpdate') === true) {
            await this.isPossibleToQueueElementByMultipleLevels(addToQueueElement, buildingZone);
        } else {
            if (await this.isPossibleToQueueElementByOneLevel(addToQueueElement, buildingZone) === false) {
                throw new QueueError("You can only upgrade a building by one level at a time");
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

    private async isPossibleToQueueElementByMultipleLevels(addToQueueElement: AddToQueueInput, buildingZone: BuildingZoneModel): Promise<Boolean> {
        const currentBuildingQueue = await this.buildingQueueRepository.getCurrentBuildingQueueForBuildingZone(buildingZone);
        const latestQueueElement = currentBuildingQueue.at(-1);

        if (!latestQueueElement) {
            return true;
        }

        if (latestQueueElement.endLevel >= addToQueueElement.endLevel) {
            throw new QueueError("New queue element should have end level higher than last queue element");
        }

        return true;
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