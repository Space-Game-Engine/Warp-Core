import {AddToQueueInput} from "@warp-core/building-queue/input/add-to-queue.input";
import {BuildingModel, BuildingZoneModel} from "@warp-core/database";

export class QueueInputValidationEvent {

    public readonly queueErrors: {
        [fieldName: string]: string[]
    } = {};

    constructor(
        public readonly addToQueueInput: AddToQueueInput,
        public readonly building: BuildingModel,
        public readonly buildingZone: BuildingZoneModel,
    ) {
    }

    addError(fieldName: string, error: string) {
        const fieldNameErrors = this.queueErrors[fieldName] ?? [];
        fieldNameErrors.push(error);

        this.queueErrors[fieldName] = fieldNameErrors;
    }

    hasError(): boolean {
        return Object.keys(this.queueErrors).length > 0;
    }
}
