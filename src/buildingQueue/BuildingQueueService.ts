import { Inject, Service } from "typedi";
import { Building, BuildingQueueElement, BuildingZone, PrismaClient } from "@prisma/client";
import { AddToQueueInput } from "./InputTypes/AddToQueueInput";
import { BuildingZoneService } from "../buildingZone/BuildingZoneService";
import { QueueError } from "./QueueError";
import { BuildingService } from "../building/BuildingService";
import { BuildingQueueFetchService } from "./BuildingQueueFetchService";
import { DateTime } from 'luxon';

@Service()
export class BuildingQueueService {

    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient,
        @Inject("CONFIG") private readonly config: any,
        private readonly buildingQueueFetch: BuildingQueueFetchService,
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingService: BuildingService,
    ) {
    }

    async addToQueue(addToQueueElement: AddToQueueInput) {
        const queueCounter = await this.buildingQueueFetch.countActiveBuildingQueueElementsForHabitat(addToQueueElement.habitatId);

        if (queueCounter >= this.config.habitat.buildingQueue.counters.maxElements) {
            throw new QueueError(`Max queue count (${this.config.habitat.buildingQueue.counters.maxElements}) has been reached`);
        }
        
        const draftQueueElement = await this.prepareDraftQueueElement(addToQueueElement);
        const queueElement = this.prisma.buildingQueueElement.create({
            data: draftQueueElement
        });

        return queueElement;
    }

     async prepareDraftQueueElement(addToQueueElement: AddToQueueInput): Promise<BuildingQueueElement> {
         const buildingZone = await this.buildingZoneService
             .getSingleBuildingZone(
                 addToQueueElement.buildingZoneId,
                 addToQueueElement.habitatId
             );

        if (await this.isAddToQueueValid(addToQueueElement, buildingZone) === false) {
            throw new QueueError('Queue element is not valid');
        }

        const startTime = await this.prepareStartTimeForQueueElement(buildingZone!);
        const queueElement: BuildingQueueElement = {
            buildingId: buildingZone!.buildingId!,
            buildingZoneId: buildingZone!.id,
            startTime: startTime,
            startLevel: buildingZone!.level,
            endLevel: addToQueueElement.endLevel,
            endTime: new Date(),
            id: 0,
        };

        queueElement.endTime = await this.prepareEndTimeForQueueElement(queueElement);

        return queueElement;
    }

    private async isAddToQueueValid(addToQueueElement: AddToQueueInput, buildingZone: BuildingZone | null): Promise<boolean> {
        if (!buildingZone) {
            throw new QueueError("Selected building zone not exists");
        }

        if (
            !buildingZone.buildingId &&
            !addToQueueElement.buildingId
        ) {
            throw new QueueError("First queue for selected building zone must have desired building Id");
        }

        if (this.config.habitat.buildingQueue.allowMultipleLevelUpdate === false) {
            if (await this.isPossibleToQueueElementByOneLevel(addToQueueElement, buildingZone) === false) {
                throw new QueueError("You can update building only one level at once");
            }
        }

        return true;
    }

    private async isPossibleToQueueElementByOneLevel(addToQueueElement: AddToQueueInput, buildingZone: BuildingZone): Promise<Boolean> {
        if (addToQueueElement.endLevel - 1 > buildingZone.level) {
            return false;
        }

        return true;
    }

    private async prepareStartTimeForQueueElement(buildingZone: BuildingZone): Promise<Date> {
        const currentBuildingQueue = await this.buildingQueueFetch.getCurrentBuildingQueueForHabitat(buildingZone.habitatId);

        if (currentBuildingQueue.length === 0) {
            return new Date();
        }

        const lastBuildingQueueElement = currentBuildingQueue.at(-1)!;

        return lastBuildingQueueElement.endTime;
    }

    private async prepareEndTimeForQueueElement(queueElement: BuildingQueueElement): Promise<Date>  {
        const startTime = DateTime.fromJSDate(queueElement.startTime);
        const upgradeTime = await this.buildingService.calculateTimeInSecondsToUpgradeBuilding(queueElement.startLevel, queueElement.endLevel, queueElement.buildingId);
        const endTime = startTime.plus({second: upgradeTime}).toJSDate();

        return endTime;
    }
}
