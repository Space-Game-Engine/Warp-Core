import { InputType, Field } from "type-graphql";
import { Building } from "./Building";

@InputType({ description: "Create or edit building" })
export class BuildingInput implements Partial<Building> {

    @Field({description: "Name of the building" })
    name: string;

    @Field({description: "Type of the building" })
    role: number;
}