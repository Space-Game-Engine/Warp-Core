import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { HabitatConfig } from "./habitat.config";
import { JwtConfig } from "./jwt.config";
import { DatabaseConfig } from "@warp-core/core/config/model/database.config";

export class CoreConfig {

    @Type(() => DatabaseConfig)
    @ValidateNested()
    database: DatabaseConfig

    @Type(() => HabitatConfig)
    @ValidateNested()
    habitat: HabitatConfig;

    @Type(() => JwtConfig)
    @ValidateNested()
    jwt: JwtConfig;
}