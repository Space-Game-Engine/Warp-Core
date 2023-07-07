import {DraftModelInterface} from "@warp-core/core/utils/model";

export interface PrepareDraftModelServiceInterface {
    /**
     * Prepare draft model to be used as preview for a user
     * @param inputData
     */
    getDraft(inputData: any): Promise<DraftModelInterface>;
}