import { IsBoolean, Min } from "class-validator";

export class BuildingQueueConfig {

    @Min(1)
    maxElements: number;

    @IsBoolean()
    allowMultipleLevelUpdate: boolean;
}