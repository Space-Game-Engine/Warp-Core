import { IsBoolean, IsNumber, Min } from "class-validator";

export class BuildingQueueConfig {
    @Min(1)
    @IsNumber()
    maxElementsInQueue: number;

    @IsBoolean()
    allowMultipleLevelUpdate: boolean;
}