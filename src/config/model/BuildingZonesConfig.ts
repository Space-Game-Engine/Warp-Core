import { IsBoolean, Min } from "class-validator";

export class BuildingZoneConfig {
    @Min(1)
    counterForNewHabitat: number;

    @IsBoolean()
    isPossibleToCreateNewZones: boolean;
}