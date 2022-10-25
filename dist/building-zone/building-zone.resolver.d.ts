import { BuildingService } from "../building/building.service";
import { HabitatService } from "../habitat/habitat.service";
import { GetSingleBuildingZoneArgs } from "./args-types/GetSingleBuildingZoneArgs";
import { BuildingZoneService } from "./building-zone.service";
import { BuildingZoneModel } from "./model/building-zone.model";
export declare class BuildingZoneResolver {
    private readonly buildingZoneService;
    private readonly habitatService;
    private readonly buildingService;
    constructor(buildingZoneService: BuildingZoneService, habitatService: HabitatService, buildingService: BuildingService);
    buildingZone({ habitatId, counterPerHabitat }: GetSingleBuildingZoneArgs): Promise<BuildingZoneModel>;
    allBuildingZones(id: number): Promise<BuildingZoneModel[]>;
    habitat(buildingZone: BuildingZoneModel): Promise<import("../habitat/model/habitat.model").HabitatModel>;
    building(buildingZone: BuildingZoneModel): Promise<import("../building/model/building.model").BuildingModel>;
}
