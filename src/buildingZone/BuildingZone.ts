import { ObjectType, Field, ID } from "type-graphql";
import { Building } from "../building/Building";
import { Habitat } from "../habitat/Habitat";

@ObjectType({ description: "Single bulding zone, you can build here single building and level it up" })
export class BuildingZone {

    /**
     * Minimal level with created building on that zone
     */
    static readonly MINIMAL_LEVEL_WITH_BUILDING = 1;

    // Real Id of building zone
    id: number;

    @Field({ description: "Building zone id counted for single habitat", name: "zoneId" })
    counterPerHabitat: number;

    @Field(type => Habitat, { description: "Habitat connected to that building zone" })
    habitat: Habitat;

    habitatId: number;

    @Field(type => Building, { nullable: true, description: "What kind of building is placed here" })
    building?: Building;

    buildingId: number;

    @Field({ description: "What level is that" })
    level: number = 0;

    @Field({ nullable: true, description: "Where is that building zone placed in our habitat" })
    placement?: string;
}