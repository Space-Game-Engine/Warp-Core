import { NonEmptyArray } from "type-graphql";
import { BuildingResolver } from "./building/BuildingResolver";
import { BuildingZoneResolver } from "./buildingZone/BuildingZoneResolver";
import { HabitatResolver } from "./habitat/HabitatResolver";

export const resolvers: NonEmptyArray<Function> = [
    HabitatResolver,
    BuildingResolver,
    BuildingZoneResolver,
];