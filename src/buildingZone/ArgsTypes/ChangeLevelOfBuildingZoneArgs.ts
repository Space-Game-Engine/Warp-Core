import { ArgsType, Field, Int } from "type-graphql";
import { BuildingZone } from "../Models/BuildingZone";
import { GetSingleBuildingZoneArgs } from "./GetSingleBuildingZoneArgs";

@ArgsType()
export class ChangeLevelOfBuildingZoneArgs extends GetSingleBuildingZoneArgs {

    @Field(type => Int, { description: "Change building levels", defaultValue: BuildingZone.MINIMAL_LEVEL_WITH_BUILDING })
    numberOfLevelsToChange: number = BuildingZone.MINIMAL_LEVEL_WITH_BUILDING;
}