import {IsNumber, IsOptional, IsString, Min} from "class-validator";

export class HabitatBuildingsConfig {
    /**
     * Id of the building from `building` table
     */
    @IsString()
    id: string;

    /**
     * Building zone id from habitat - there will be placed a new building
     */
    @IsNumber()
    @Min(1)
    localBuildingZoneId: number;

    /**
     * What level should new building have?
     */
    @IsNumber()
    @Min(1)
    @IsOptional()
    level: number = 1;
}