import { BuildingDetailsAtCertainLevelModel } from "./model/building-details-at-certain-level.model";
import { BuildingModel } from "./model/building.model";
export declare class BuildingModule {
    static entities(): (typeof BuildingDetailsAtCertainLevelModel | typeof BuildingModel)[];
}
