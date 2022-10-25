import { BuildingZoneModel } from "../../building-zone/model/building-zone.model";
import { BuildingModel } from "../../building/model/building.model";
export declare class BuildingQueueElementModel {
    id: number;
    startLevel: number;
    endLevel: number;
    startTime: Date;
    endTime: Date;
    building: BuildingModel;
    buildingZone: BuildingZoneModel;
}
