import { Field, InputType, Int } from "@nestjs/graphql";

@InputType({description: "Creates new habitat"})
export class NewHabitatInput {

    @Field(type => Int, {description: "User id"})
    userId: number;

    @Field({nullable: true, description: "Is that main habitat?"})
    isMain?: boolean;

    @Field({ description: "Name of the habitat" })
    name: string = "default name";
}
