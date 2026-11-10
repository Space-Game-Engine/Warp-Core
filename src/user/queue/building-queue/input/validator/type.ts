import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';

export type QueueInputValidation = {
	addToQueueInput: AddToQueueInput;
	building: BuildingModel;
	buildingZone: BuildingZoneModel;
	validationError: QueueValidationError;
};
