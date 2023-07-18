import {IsNumber, IsString, Min} from "class-validator";

export class HabitatResourcesConfig {

    @IsString()
    id: string;

    @IsNumber()
    @Min(0)
    amount: string;
}