import { Injectable } from '@nestjs/common';
import {
    AbstractNewQueueElementValidator
} from "@warp-core/building-queue/input/validator/abstract-new-queue-element.validator";

@Injectable()
export class DraftQueueElementValidator extends AbstractNewQueueElementValidator {
    protected getEventName(): string {
        return 'building_queue.validating.draft_queue_element';
    };
}