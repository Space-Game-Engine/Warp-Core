import { ObjectType, Field, ID } from "type-graphql";

@ObjectType({ description: "Single bulding type, describes its role in game" })
export class Building {
    @Field(type => ID)
    id: number;

    @Field({ description: "Role says what that building do" })
    role: number;

    @Field({ description: "What name that kind of building have" })
    name: string;
}