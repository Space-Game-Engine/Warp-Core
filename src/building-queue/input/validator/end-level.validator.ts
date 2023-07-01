import {OnEvent} from "@nestjs/event-emitter";
import {QueueInputValidationEvent} from "@warp-core/building-queue/event/queue-input-validation.event";
import {Injectable} from '@nestjs/common';

@Injectable()
export class EndLevelValidator {
    constructor() {
    }

    @OnEvent('building_queue.validating.add_to_queue', {async: true})
    async validate(queueValidationEvent: QueueInputValidationEvent) {
        const addToQueue = queueValidationEvent.addToQueueInput;
        const buildingZone = queueValidationEvent.buildingZone;
        const building = queueValidationEvent.building;

        if (addToQueue.endLevel < buildingZone.level) {
            queueValidationEvent.addError('endLevel', 'End level should not be lower than existing level.');
            return;
        }
        if (addToQueue.endLevel === buildingZone.level) {
            queueValidationEvent.addError('endLevel', 'End level should not equal existing level.');
            return;
        }

        const lastPossibleUpdate = (await building.buildingDetailsAtCertainLevel).at(-1);

        if (addToQueue.endLevel > lastPossibleUpdate.level) {
            queueValidationEvent.addError('endLevel', 'You cannot update higher than it is possible. Check Building update details.');
        }
    }
}
