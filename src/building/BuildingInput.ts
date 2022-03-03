import { InputType, Field } from "type-graphql";
import { Building } from "./Building";

@InputType({ description: "Creates new building type" })
export class BuildingInput implements Partial<Building> {

    @Field({ nullable: true, description: "Name of the building" })
    name?: string;

    @Field({ nullable: true, description: "Type of the building" })
    role?: number;
}