import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {QueueProcessing} from '@warp-core/user/queue/core';

export type ResearchQueueProcessing =
	QueueProcessing<ResearchQueueElementModel>;
