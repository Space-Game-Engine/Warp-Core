import {DraftModelInterface} from "@warp-core/core/utils";

export interface ProcessAndConsumeResourcesServiceInterface {
    processAndConsumeResources(inputData: any): Promise<DraftModelInterface>;
}