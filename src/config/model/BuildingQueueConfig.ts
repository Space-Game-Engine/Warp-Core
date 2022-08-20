import { IsBoolean, Min } from "class-validator";

export class BuildingQueueConfig {

    @Min(1)
    maxElementsInQueue: number;

    @IsBoolean()
    allowMultipleLevelUpdate: boolean;
}