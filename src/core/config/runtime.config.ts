import {Type} from "class-transformer";
import {HabitatConfig} from "@warp-core/core/config/model/habitat.config";
import {ValidateNested} from "class-validator";

export class RuntimeConfig {

    /**
     * All configurations related to user habitat
     */
    @Type(() => HabitatConfig)
    @ValidateNested()
    habitat: HabitatConfig;
}