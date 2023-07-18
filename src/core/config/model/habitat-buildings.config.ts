import {IsNumber, IsOptional, IsString, Min} from "class-validator";

export class HabitatBuildingsConfig {
    @IsString()
    id: string;

    @IsNumber()
    @Min(1)
    localBuildingZoneId: number;

    @IsNumber()
    @Min(1)
    @IsOptional()
    level: number = 1;
}