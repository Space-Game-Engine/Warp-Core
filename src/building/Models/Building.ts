import {Field, ID, ObjectType} from "type-graphql";
import {BuildingDetailsAtCertainLevel} from "./BuildingDetailsAtCertainLevel";

@ObjectType({description: "Single building type, describes its role in game"})
export class Building {
    @Field(type => ID)
    id: number;

    @Field({description: "Role says what that building do"})
    role: number;

    @Field({description: "What name that kind of building have"})
    name: string;

    @Field(type => [BuildingDetailsAtCertainLevel], { description: "Details how to upgrade that building" })
    buildingDetailsAtCertainLevel: BuildingDetailsAtCertainLevel[];
}
