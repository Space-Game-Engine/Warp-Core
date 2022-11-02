import { IsBoolean, IsNumber, Min } from "class-validator";

export class BuildingZoneConfig {
    @Min(1)
    @IsNumber()
    counterForNewHabitat: number;

    @IsBoolean()
    isPossibleToCreateNewZones: boolean;
}