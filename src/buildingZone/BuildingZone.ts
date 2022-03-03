import { ObjectType, Field, ID } from "type-graphql";
import { Building } from "../building/Building";
import { Habitat } from "../habitat/Habitat";

@ObjectType({ description: "Single bulding zone, you can build here single building and level it up" })
export class BuildingZone {
    @Field(type => ID)
    id: number;

    @Field(type => Habitat, {description: "Habitat connected to that building zone"})
    habitat: Habitat;

    @Field(type => Building, {nullable: true, description: "What kind of building is placed here"})
    building?: Building;

    @Field({description: "What level is that"})
    level: number = 0;

    @Field({nullable: true, description: "Where is that building zone placed in our habitat"})
    placement?: string;
}