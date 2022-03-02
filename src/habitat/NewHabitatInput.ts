import { Habitat } from "./Habitat";
import { InputType, Field } from "type-graphql";

@InputType({ description: "Creates new habitat" })
export class NewHabitatInput implements Partial<Habitat> {

    @Field({ description: "User id" })
    userId: number;

    @Field({ nullable: true, description: "Is that main habitat?" })
    isMain?: boolean;

    @Field({ description: "Name of the habitat" })
    name: string = "default name";
}