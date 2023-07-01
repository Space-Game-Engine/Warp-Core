import {Injectable} from "@nestjs/common";
import {BuildingQueueRepository} from "@warp-core/database";
import {ConfigService} from "@nestjs/config";
import {AuthorizedHabitatModel} from "@warp-core/auth";
import {OnEvent} from "@nestjs/event-emitter";
import {QueueInputValidationEvent} from "@warp-core/building-queue/event/queue-input-validation.event";

@Injectable()
export class MaxQueueCountValidator {

    constructor(
        private readonly buildingQueueRepository: BuildingQueueRepository,
        private readonly configService: ConfigService,
        private readonly habitatModel: AuthorizedHabitatModel,
    ) {
    }

    @OnEvent('building_queue.validating.add_to_queue', {async: true})
    async validate(queueValidationEvent: QueueInputValidationEvent) {
        const queueCounter = await this.buildingQueueRepository.countActiveBuildingQueueElementsForHabitat(this.habitatModel.id);
        const maxElementsInQueue = this.configService.get<number>('habitat.buildingQueue.maxElementsInQueue');

        if (queueCounter >= maxElementsInQueue) {
            queueValidationEvent.addError('queueInput', `Max queue count (${maxElementsInQueue}) has been reached`);
        }
    }

}