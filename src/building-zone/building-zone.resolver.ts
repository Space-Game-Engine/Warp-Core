import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BuildingService } from "../building/building.service";
import { HabitatService } from "../habitat/habitat.service";
import { GetSingleBuildingZoneArgs } from "./args-types/GetSingleBuildingZoneArgs";
import { BuildingZoneService } from "./building-zone.service";
import { BuildingZoneModel } from "./model/building-zone.model";

@Resolver(of => BuildingZoneModel)
export class BuildingZoneResolver {
    constructor(
        private readonly buildingZoneService: BuildingZoneService,
        private readonly habitatService: HabitatService,
        private readonly buildingService: BuildingService,
    ) { }

    @Query(returns => BuildingZoneModel, { nullable: true, description: "Returns single building zone", name: "buildingZone_get" })
    buildingZone(
        @Args() { habitatId, counterPerHabitat }: GetSingleBuildingZoneArgs
    ) {
        return this.buildingZoneService.getSingleBuildingZone(counterPerHabitat, habitatId);
    }

    @Query(returns => [BuildingZoneModel], { nullable: true, description: "Returns all building zones for single habitat", name: "buildingZone_getAll" })
    allBuildingZones(
        @Args("habitatId", { type: () => Int }) id: number
    ) {
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(id);
    }

    @ResolveField()
    habitat(
        @Parent() buildingZone: BuildingZoneModel
    ) {
        return this.habitatService.getHabitatById(buildingZone.habitatId);
    }

    @ResolveField()
    building(
        @Parent() buildingZone: BuildingZoneModel
    ) {
        if (!buildingZone.building) {
            return null;
        }

        return this.buildingService.getBuildingById(buildingZone.building.id);
    }
}