import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {QueueProcessing} from '@warp-core/user/queue/core';

export type UnitQueueProcessing = QueueProcessing<UnitQueueElementModel>;
