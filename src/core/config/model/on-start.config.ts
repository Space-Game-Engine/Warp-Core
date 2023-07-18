import {HabitatResourcesConfig} from "@warp-core/core/config/model/habitat-resources.config";
import {Type} from "class-transformer";
import {IsOptional, ValidateNested} from "class-validator";
import {HabitatBuildingsConfig} from "@warp-core/core/config/model/habitat-buildings.config";

export class OnStartConfig {

    @Type(() => HabitatResourcesConfig)
    @ValidateNested()
    @IsOptional()
    resources: HabitatResourcesConfig[];

    @Type(() => HabitatBuildingsConfig)
    @ValidateNested()
    @IsOptional()
    buildings: HabitatBuildingsConfig[];
}