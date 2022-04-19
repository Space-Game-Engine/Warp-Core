import { Field, InputType, Int } from "type-graphql";

@InputType({description: "Construct new building"})
export class ConstructBuildingInput {

    @Field(type => Int, {description: "One of existing buildings"})
    buildingId: number;
}