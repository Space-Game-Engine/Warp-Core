import {DraftModelInterface} from '@warp-core/core/utils/model/draft.model-interface';

export interface ResourceConsumerResolverInterface {
	/**
	 * Returns a draft of the thing that will use resources
	 */
	getDraft(inputData: object): Promise<DraftModelInterface>;

	processAndConsumeResources(inputData: object): Promise<DraftModelInterface>;
}
