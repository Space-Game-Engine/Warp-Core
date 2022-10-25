import { Repository } from "typeorm";
import { BuildingZoneModel } from "../building-zone/model/building-zone.model";
import { BuildingQueueElementModel } from "./model/building-queue-element.model";
export declare class BuildingQueueFetchService {
    private readonly buildingQueueRepository;
    constructor(buildingQueueRepository: Repository<BuildingQueueElementModel>);
    getCurrentBuildingQueueForHabitat(habitatId: number): Promise<BuildingQueueElementModel[]>;
    getCurrentBuildingQueueForBuildingZone(buildingZone: BuildingZoneModel): Promise<BuildingQueueElementModel[]>;
    getSingleBuildingQueueElementById(queueElementId: number): Promise<BuildingQueueElementModel>;
    countActiveBuildingQueueElementsForHabitat(habitatId: number): Promise<number>;
}
