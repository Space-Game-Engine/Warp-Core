import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { HabitatConfig } from "./HabitatConfig";

export class CoreConfig {

    @Type(() => HabitatConfig)
    @ValidateNested()
    habitat: HabitatConfig;
}