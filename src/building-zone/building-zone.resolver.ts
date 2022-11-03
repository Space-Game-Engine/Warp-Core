import { Args, Int, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CurrentHabitat } from "../auth/decorator/get-current-habitat.decorator";
import { BuildingService } from "../building/building.service";
import { HabitatService } from "../habitat/habitat.service";
import { HabitatModel } from "../habitat/model/habitat.model";
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
        @Args("counterPerHabitat", { type: () => Int }) counterPerHabitat: number,
        @CurrentHabitat() habitat: HabitatModel
    ) {
        return this.buildingZoneService.getSingleBuildingZone(counterPerHabitat, habitat.id);
    }

    @Query(returns => [BuildingZoneModel], { nullable: true, description: "Returns all building zones for single habitat", name: "buildingZone_getAll" })
    allBuildingZones(
        @CurrentHabitat() habitat: HabitatModel
    ) {
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(habitat.id);
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