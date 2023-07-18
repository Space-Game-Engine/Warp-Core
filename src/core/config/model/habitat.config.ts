import { Type } from "class-transformer";
import {IsOptional, ValidateNested} from "class-validator";
import { BuildingQueueConfig } from "./building-queue.config";
import { BuildingZoneConfig } from "./building-zones.config";
import {OnStartConfig} from "@warp-core/core/config/model/on-start.config";

export class HabitatConfig {

    @Type(() => BuildingZoneConfig)
    @ValidateNested()
    buildingZones: BuildingZoneConfig;

    @Type(() => BuildingQueueConfig)
    @ValidateNested()
    buildingQueue: BuildingQueueConfig;

    @Type(() => OnStartConfig)
    @ValidateNested()
    @IsOptional()
    onStart: OnStartConfig;
}