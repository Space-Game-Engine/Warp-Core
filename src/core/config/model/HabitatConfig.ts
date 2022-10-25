import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { BuildingQueueConfig } from "./BuildingQueueConfig";
import { BuildingZoneConfig } from "./BuildingZonesConfig";

export class HabitatConfig {

    @Type(() => BuildingZoneConfig)
    @ValidateNested()
    buildingZones: BuildingZoneConfig;

    @Type(() => BuildingQueueConfig)
    @ValidateNested()
    buildingQueue: BuildingQueueConfig;
}