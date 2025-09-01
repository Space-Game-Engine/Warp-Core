import {DraftModelInterface} from '@warp-core/core/utils';

export interface ProcessAndConsumeResourcesServiceInterface {
	saveQueueElement(inputData: object): Promise<DraftModelInterface>;
}
