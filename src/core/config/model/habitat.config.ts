import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { BuildingQueueConfig } from "./building-queue.config";
import { BuildingZoneConfig } from "./building-zones.config";

export class HabitatConfig {

    @Type(() => BuildingZoneConfig)
    @ValidateNested()
    buildingZones: BuildingZoneConfig;

    @Type(() => BuildingQueueConfig)
    @ValidateNested()
    buildingQueue: BuildingQueueConfig;
}