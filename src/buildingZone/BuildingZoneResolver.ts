import {
    Resolver,
    Query,
    Arg,
    Mutation,
    FieldResolver,
    Root,
} from "type-graphql";
import { Service } from "typedi";
import { HabitatService } from "../habitat/HabitatService";
import { BuildingZone } from "./BuildingZone";
import { BuildingZoneService } from "./BuildingZoneService";

@Service()
@Resolver(of => BuildingZone)
export class BuildingZoneResolver {
    constructor(
        private readonly buildingZoneService: BuildingZoneService,
        private readonly habitatService: HabitatService,
    ) { }

    @Query(returns => BuildingZone, { nullable: true, description: "Returns single building zone" })
    buildingZone(
        @Arg("habitatId") habitatId: number,
        @Arg("counterPerHabitat") counterPerHabitat: number
    ) {
        return this.buildingZoneService.getSingleBuildingZone(counterPerHabitat, habitatId);
    }

    @Query(returns => [BuildingZone], { nullable: true, description: "Returns all building zones for single habitat" })
    allBuildingZones(
        @Arg("habitatId") habitatId: number
    ) {
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(habitatId);
    }

    @Mutation(returns => BuildingZone, { description: "Create new building zone for selected habitat" })
    createNewBuildingZone(
        @Arg("habitatId") habitatId: number,
    ) {
        return this.buildingZoneService.createNewBuildingZone(habitatId);
    }

    @FieldResolver()
    habitat(
        @Root() buildingZone: BuildingZone
    ) {
        return this.habitatService.getHabitatById(buildingZone.habitatId);
    }
}