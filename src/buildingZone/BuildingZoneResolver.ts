import {
    Resolver,
    Query,
    Arg,
    Mutation,
    FieldResolver,
    Root,
} from "type-graphql";
import { Service } from "typedi";
import { BuildingZone } from "./BuildingZone";
import { BuildingZoneService } from "./BuildingZoneService";

@Service()
@Resolver(of => BuildingZone)
export class BuildingZoneResolver {
    constructor(
        private readonly buildingZoneService: BuildingZoneService
    ) { }

    @Query(returns => BuildingZone, { nullable: true, description: "Returns single building zone" })
    buildingZone(
        @Arg("habitatId") habitatId: number,
        @Arg("counterPerHabitat") counterPerHabitat: number
    ) {
        return this.buildingZoneService.getSingleBuildingZone(counterPerHabitat, habitatId);
    }

    // @Query(returns => [BuildingZone], { nullable: true, description: "Returns all possible building types" })
    // allBuildings() {
    //     return this.buildingZoneService.getAllBuildings();
    // }

    @Mutation(returns => BuildingZone, { description: "Create new building type" })
    createNewBuildingZone(
        @Arg("habitatId") habitatId: number,
    ) {
        return this.buildingZoneService.createNewBuildingZone(habitatId);
    }

    @FieldResolver()
    habitat(
        @Root() buildingZone: BuildingZone
    ) {
        return this.buildingZoneService.getHabitat(buildingZone.id);
    }
}