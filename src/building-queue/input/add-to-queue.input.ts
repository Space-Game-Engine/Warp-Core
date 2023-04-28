
import { Field, InputType, Int} from "@nestjs/graphql";
import {  IsNumber, IsOptional, IsPositive} from "class-validator";

@InputType({description: "Creates new element in queue"})
export class AddToQueueInput
{
    @IsNumber({}, {message: 'Building zone id must be a number'})
    @IsPositive({ message: 'Building zone id must be a positive number' })
    @Field(type => Int,{description: "Local Id of building zone"})
    localBuildingZoneId: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Field(type => Int, {
        description: "Id of building type that will be constructed. If building is already placed, that field will be ignored",
        nullable: true,
    })
    buildingId?: number;

    @IsNumber()
    @IsPositive()
    @Field(type => Int, { description: "How much levels will be build" })
    endLevel: number;
}
