import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { HabitatCreatedEvent } from "../habitat/event/habitat-created.event";
import { HabitatModel } from "../habitat/model/habitat.model";
import { BuildingZoneModel } from "./model/building-zone.model";
export declare class BuildingZoneService {
    private readonly buildingZoneRepository;
    private readonly configService;
    constructor(buildingZoneRepository: Repository<BuildingZoneModel>, configService: ConfigService);
    getAllBuildingZonesByHabitatId(habitatId: number): Promise<BuildingZoneModel[]>;
    getSingleBuildingZone(counterPerHabitat: number, habitatId: number): Promise<BuildingZoneModel | null>;
    getSingleBuildingZoneById(buildingZoneId: number): Promise<BuildingZoneModel | null>;
    private getMaxOfCounterPerHabitat;
    createNewBuildingZone(habitat: HabitatModel): Promise<BuildingZoneModel>;
    createBuildingZoneOnNewHabitatCreation(payload: HabitatCreatedEvent): Promise<void>;
}
