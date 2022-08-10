import {Field, InputType, Int} from "type-graphql";
import {BuildingQueueElement} from "../Models/BuildingQueueElement";

@InputType({description: "Creates new element in queue"})
export class AddToQueueInput implements Partial <BuildingQueueElement>{

    @Field(type => Int, {description: "Habitat Id"})
    habitatId: number;

    @Field(type => Int,{description: "Local Id of building zone"})
    buildingZoneId: number;

    @Field(type => Int, {
        description: "Id of building type that will be constructed. If building is already placed, that field will be ignored"
    })
    buildingId?: number;

    @Field(type => Int, {description: "How much levels will be build"})
    endLevel: number;
}
