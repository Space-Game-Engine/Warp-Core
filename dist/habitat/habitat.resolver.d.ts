import { BuildingZoneService } from "../building-zone/building-zone.service";
import { HabitatService } from "./habitat.service";
import { NewHabitatInput } from "./input/NewHabitatInput";
import { HabitatModel } from "./model/habitat.model";
export declare class HabitatResolver {
    private readonly habitatService;
    private readonly buildingZoneService;
    constructor(habitatService: HabitatService, buildingZoneService: BuildingZoneService);
    habitat(id: number): Promise<HabitatModel>;
    userHabitats(id: number): Promise<HabitatModel[]>;
    addHabitat(newHabitatData: NewHabitatInput): Promise<HabitatModel>;
    buildingZones(habitat: HabitatModel): Promise<import("../building-zone/model/building-zone.model").BuildingZoneModel[]>;
}
