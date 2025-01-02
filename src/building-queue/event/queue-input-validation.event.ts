import {QueueValidationErrorType} from '@warp-core/building-queue/exception/queue-validation-error.type';
import {AddToQueueInput} from '@warp-core/building-queue/input/add-to-queue.input';
import {BuildingModel, BuildingZoneModel} from '@warp-core/database';

export class QueueInputValidationEvent {
	public readonly queueErrors: QueueValidationErrorType = {};

	constructor(
		public readonly addToQueueInput: AddToQueueInput,
		public readonly building: BuildingModel,
		public readonly buildingZone: BuildingZoneModel,
	) {}

	public addError(fieldName: string, error: string): void {
		const fieldNameErrors = this.queueErrors[fieldName] ?? [];
		fieldNameErrors.push(error);

		this.queueErrors[fieldName] = fieldNameErrors;
	}

	public hasError(): boolean {
		return Object.keys(this.queueErrors).length > 0;
	}
}
