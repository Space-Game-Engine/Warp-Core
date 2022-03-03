import { NonEmptyArray } from "type-graphql";
import { BuildingResolver } from "./building/BuildingResolver";
import { HabitatResolver } from "./habitat/HabitatResolver";

export const resolvers: NonEmptyArray<Function> = [
    HabitatResolver,
    BuildingResolver
];