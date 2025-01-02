import {DraftModelInterface} from '@warp-core/core/utils';

export interface ProcessAndConsumeResourcesServiceInterface {
	processAndConsumeResources(inputData: object): Promise<DraftModelInterface>;
}
