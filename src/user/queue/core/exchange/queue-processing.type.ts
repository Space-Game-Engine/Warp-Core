import {QueueElementModelInterface} from '@warp-core/core/utils';

export type QueueProcessing<
	T extends QueueElementModelInterface = QueueElementModelInterface,
> = {
	queueElement: T;
};
