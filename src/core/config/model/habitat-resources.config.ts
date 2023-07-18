import {IsNumber, IsString, Min} from "class-validator";

export class HabitatResourcesConfig {

    /**
     * Resource id from `resource` table
     */
    @IsString()
    id: string;

    /**
     * How many resources user will have at the beginning?
     */
    @IsNumber()
    @Min(0)
    amount: string;
}