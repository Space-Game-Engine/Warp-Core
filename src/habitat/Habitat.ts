import { ObjectType, Field, ID } from "type-graphql";
import { BuildingZone } from "../buildingZone/Models/BuildingZone";

@ObjectType({ description: "Single habitat that belongs to user" })
export class Habitat {
    @Field(type => ID)
    id: number;

    @Field({ description: "Custom name of the habitat" })
    name: string;

    @Field()
    userId: number;

    @Field({ description: "Is that habitat a capital one" })
    isMain: boolean;

    @Field(type => [BuildingZone])
    buildingZones: BuildingZone[];
}