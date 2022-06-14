import {Field, ID, Int, ObjectType} from "type-graphql";
import {Building} from "./Building";

@ObjectType({description: "Details how to upgrade single building"})
export class BuildingDetailsAtCertainLevel {
    @Field(type => ID)
    id: number;

    @Field(type => Building, {description: "Building connected to that details"})
    building: Building;

    @Field(type => Int, {description: "What level is described by this entry"})
    level: number;

    @Field(type => Int, {description: "How much time it takes to upgrade that building"})
    timeToUpdateBuildingInSeconds: number;
    //
    // @Field({description: "What should you do to make an upgrade"})
    // requirements: object;
}
