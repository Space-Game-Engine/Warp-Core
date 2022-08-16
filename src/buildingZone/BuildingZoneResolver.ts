import {
    Resolver,
    Query,
    Arg,
    Mutation,
    FieldResolver,
    Root,
    Args,
    Int,
} from "type-graphql";
import { Service } from "typedi";
import { BuildingService } from "../building/BuildingService";
import { HabitatService } from "../habitat/HabitatService";
import { BuildingZone } from "./Models/BuildingZone";
import { BuildingZoneService } from "./BuildingZoneService";
import { GetSingleBuildingZoneArgs } from "./ArgsTypes/GetSingleBuildingZoneArgs";

@Service()
@Resolver(of => BuildingZone)
export class BuildingZoneResolver {
    constructor(
        private readonly buildingZoneService: BuildingZoneService,
        private readonly habitatService: HabitatService,
        private readonly buildingService: BuildingService,
    ) { }

    @Query(returns => BuildingZone, { nullable: true, description: "Returns single building zone", name: "buildingZone_get" })
    buildingZone(
        @Args() { habitatId, counterPerHabitat }: GetSingleBuildingZoneArgs
    ) {
        return this.buildingZoneService.getSingleBuildingZone(counterPerHabitat, habitatId);
    }

    @Query(returns => [BuildingZone], { nullable: true, description: "Returns all building zones for single habitat", name: "buildingZone_getAll" })
    allBuildingZones(
        @Arg("habitatId", type => Int) habitatId: number
    ) {
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(habitatId);
    }

    @Mutation(returns => BuildingZone, { description: "Create new building zone for selected habitat", name: "buildingZone_create" })
    createNewBuildingZone(
        @Arg("habitatId", type => Int) habitatId: number,
    ) {
        return this.buildingZoneService.createNewBuildingZone(habitatId);
    }

    @Mutation(returns => BuildingZone, { description: "Destroys selected building zone", name: "buildingZone_delete" })
    destroyBuildingZone(
        @Args() { habitatId, counterPerHabitat }: GetSingleBuildingZoneArgs
    ) {
        return this.buildingZoneService.destroyBuildingZone(counterPerHabitat, habitatId);
    }

    @FieldResolver()
    habitat(
        @Root() buildingZone: BuildingZone
    ) {
        return this.habitatService.getHabitatById(buildingZone.habitatId);
    }

    @FieldResolver()
    building(
        @Root() buildingZone: BuildingZone
    ) {
        if (!buildingZone.buildingId) {
            return null;
        }

        return this.buildingService.getBuildingById(buildingZone.buildingId);
    }
}