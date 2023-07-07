import {DraftModelInterface} from "@warp-core/core/utils/model/draft.model-interface";

export interface ResourceConsumerResolverInterface {
    /**
     * Returns a draft of the thing that will use resources
     */
    getDraft(inputData: any): Promise<DraftModelInterface>;

    processAndConsumeResources(inputData: any): Promise<DraftModelInterface>;
}