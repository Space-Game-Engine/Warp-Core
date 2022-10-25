import { BuildingService } from "./building.service";
import { BuildingModel } from "./model/building.model";
export declare class BuildingResolver {
    private readonly buildingService;
    constructor(buildingService: BuildingService);
    building(id: number): Promise<BuildingModel>;
    allBuildings(): Promise<BuildingModel[]>;
}
