import { BuildingModel } from "../../building/model/building.model";
import { HabitatModel } from "../../habitat/model/habitat.model";
export declare class BuildingZoneModel {
    static readonly MINIMAL_BUILDING_LEVEL = 1;
    id: number;
    counterPerHabitat: number;
    habitat: HabitatModel;
    habitatId: number;
    building?: BuildingModel;
    buildingId?: number;
    level: number;
    placement?: string;
}
