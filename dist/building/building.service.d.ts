import { Repository } from "typeorm";
import { BuildingModel } from "./model/building.model";
export declare class BuildingService {
    private buildingRepository;
    constructor(buildingRepository: Repository<BuildingModel>);
    getBuildingById(buildingId: number): Promise<BuildingModel | null>;
    getAllBuildings(): Promise<BuildingModel[]>;
    calculateTimeInSecondsToUpgradeBuilding(startLevel: number, endLevel: number, buildingId: number): Promise<number>;
}
