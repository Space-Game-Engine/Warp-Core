import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {QueueProcessing} from '@warp-core/user/queue/core';

export type BuildingQueueProcessing =
	QueueProcessing<BuildingQueueElementModel>;
