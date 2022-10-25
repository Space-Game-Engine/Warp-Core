import { BuildingZoneModel } from "../../building-zone/model/building-zone.model";
export declare class HabitatModel {
    id: number;
    name: string;
    userId: number;
    isMain: boolean;
    buildingZones: BuildingZoneModel[];
}
