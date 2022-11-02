import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { HabitatConfig } from "./habitat.config";
import { JwtConfig } from "./jwt.config";

export class CoreConfig {

    @Type(() => HabitatConfig)
    @ValidateNested()
    habitat: HabitatConfig;

    @Type(() => JwtConfig)
    @ValidateNested()
    jwt: JwtConfig;
}