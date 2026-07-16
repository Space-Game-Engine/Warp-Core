import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {QueueValidationError} from '@warp-core/user/queue/building-queue/exception/queue-validation.error';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

export type QueueInputValidation = {
	addToQueueInput: AddToQueueInput;
	building: BuildingModel;
	buildingZone: BuildingZoneModel;
	validationError: QueueValidationError;
};
