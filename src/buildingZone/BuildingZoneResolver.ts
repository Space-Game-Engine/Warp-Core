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
import { BuildingZone } from "./BuildingZone";
import { BuildingZoneService } from "./BuildingZoneService";
import { ConstructBuildingInput } from "./InputTypes/ConstructBuildingInput";
import { GetSingleBuildingZoneArgs } from "./ArgsTypes/GetSingleBuildingZoneArgs";
import { ChangeLevelOfBuildingZoneArgs } from "./ArgsTypes/ChangeLevelOfBuildingZoneArgs";

@Service()
@Resolver(of => BuildingZone)
export class BuildingZoneResolver {
    constructor(
        private readonly buildingZoneService: BuildingZoneService,
        private readonly habitatService: HabitatService,
        private readonly buildingService: BuildingService,
    ) { }

    @Query(returns => BuildingZone, { nullable: true, description: "Returns single building zone" })
    buildingZone(
        @Args() { habitatId, counterPerHabitat }: GetSingleBuildingZoneArgs
    ) {
        return this.buildingZoneService.getSingleBuildingZone(counterPerHabitat, habitatId);
    }

    @Query(returns => [BuildingZone], { nullable: true, description: "Returns all building zones for single habitat" })
    allBuildingZones(
        @Arg("habitatId", type => Int) habitatId: number
    ) {
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(habitatId);
    }

    @Mutation(returns => BuildingZone, { description: "Create new building zone for selected habitat" })
    createNewBuildingZone(
        @Arg("habitatId", type => Int) habitatId: number,
    ) {
        return this.buildingZoneService.createNewBuildingZone(habitatId);
    }

    @Mutation(returns => BuildingZone, { description: "Constructs a building on single building zone" })
    constructBuildingOnBuildingZone(
        @Args() { habitatId, counterPerHabitat }: GetSingleBuildingZoneArgs,
        @Arg('constructBuilding') constructBuilding: ConstructBuildingInput
    ) {
        return this.buildingZoneService.constructBuildingOnBuildingZone(counterPerHabitat, habitatId, constructBuilding);
    }

    @Mutation(returns => BuildingZone, { description: "Upgrades a building level on single building zone" })
    upgradeBuildingZone(
        @Args() { habitatId, counterPerHabitat, numberOfLevelsToChange }: ChangeLevelOfBuildingZoneArgs
    ) {
        return this.buildingZoneService.upgradeBuildingZone(counterPerHabitat, habitatId, numberOfLevelsToChange);
    }

    @Mutation(returns => BuildingZone, { description: "Downgrades a building level on single building zone" })
    downgradeBuildingZone(
        @Args() { habitatId, counterPerHabitat, numberOfLevelsToChange }: ChangeLevelOfBuildingZoneArgs
    ) {
        return this.buildingZoneService.downgradeBuildingZone(counterPerHabitat, habitatId, numberOfLevelsToChange);
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