import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {QueueInputValidationEvent} from "@warp-core/building-queue/event/queue-input-validation.event";
import {ConfigService} from "@nestjs/config";
import {AddToQueueInput} from "@warp-core/building-queue/input/add-to-queue.input";
import {BuildingQueueRepository, BuildingZoneModel} from "@warp-core/database";

@Injectable()
export class ConfigurationValidator {
    constructor(
        private readonly buildingQueueRepository: BuildingQueueRepository,
        private readonly configService: ConfigService,
    ) {
    }

    @OnEvent('building_queue.validating.add_to_queue')
    @OnEvent('building_queue.validating.draft_queue_element')
    async validate(queueValidationEvent: QueueInputValidationEvent) {
        const addToQueueElement = queueValidationEvent.addToQueueInput;
        const buildingZone = queueValidationEvent.buildingZone;

        if (this.configService.get<boolean>('habitat.buildingQueue.allowMultipleLevelUpdate') === true) {
             const errorMessage = await this.isPossibleToQueueElementByMultipleLevels(addToQueueElement, buildingZone);
             if (errorMessage) {
                 queueValidationEvent.addError('endLevel', errorMessage);
             }
        } else {
            if (await this.isPossibleToQueueElementByOneLevel(addToQueueElement, buildingZone) === false) {
                queueValidationEvent.addError('endLevel', "You can only upgrade a building by one level at a time");
            }
        }
    }

    private async isPossibleToQueueElementByOneLevel(addToQueueElement: AddToQueueInput, buildingZone: BuildingZoneModel): Promise<Boolean> {
        return addToQueueElement.endLevel - 1 <= buildingZone.level;
    }

    private async isPossibleToQueueElementByMultipleLevels(addToQueueElement: AddToQueueInput, buildingZone: BuildingZoneModel): Promise<string | null> {
        const currentBuildingQueue = await this.buildingQueueRepository.getCurrentBuildingQueueForBuildingZone(buildingZone);
        const latestQueueElement = currentBuildingQueue.at(-1);

        if (!latestQueueElement) {
            return;
        }

        if (latestQueueElement.endLevel >= addToQueueElement.endLevel) {
            return "New queue element should have end level higher than last queue element";
        }

        return;
    }
}