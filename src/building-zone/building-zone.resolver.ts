import { Args, Int, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BuildingQueueFetchService } from "@warp-core/building-queue/building-queue-fetch.service";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { BuildingService } from "@warp-core/building/building.service";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { HabitatService } from "@warp-core/habitat/habitat.service";

@Resolver(of => BuildingZoneModel)
export class BuildingZoneResolver {
    constructor(
        private readonly buildingZoneService: BuildingZoneService,
        private readonly habitatService: HabitatService,
        private readonly buildingService: BuildingService,
        private readonly buildingQueueFetchService: BuildingQueueFetchService,
    ) { }

    @Query(returns => BuildingZoneModel, { nullable: true, description: "Returns single building zone", name: "buildingZone_get" })
    buildingZone(
        @Args("counterPerHabitat", { type: () => Int }) counterPerHabitat: number
    ) {
        return this.buildingZoneService.getSingleBuildingZone(counterPerHabitat);
    }

    @Query(returns => [BuildingZoneModel], { nullable: true, description: "Returns all building zones for single habitat", name: "buildingZone_getAll" })
    allBuildingZones() {
        return this.buildingZoneService.getAllZonesForCurrentHabitat();
    }

    @ResolveField()
    habitat(
        @Parent() buildingZone: BuildingZoneModel
    ) {
        return this.habitatService.getCurrentHabitat();
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

    @ResolveField()
    buildingQueue(
        @Parent() buildingZone: BuildingZoneModel
    ) {
        return this.buildingQueueFetchService.getCurrentBuildingQueueForBuildingZone(buildingZone);
    }
}