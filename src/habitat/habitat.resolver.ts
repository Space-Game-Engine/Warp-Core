import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BuildingQueueFetchService } from "@warp-core/building-queue/building-queue-fetch.service";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { HabitatService } from "./habitat.service";

@Resolver(of => HabitatModel)
export class HabitatResolver {
    constructor(
        private readonly habitatService: HabitatService,
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingQueueFetchService: BuildingQueueFetchService
    ) { }

    @Query(returns => HabitatModel, { nullable: true, description: "Get single habitat for logged in token", name: "habitat_get" })
    habitat() {
        return this.habitatService.getCurrentHabitat();
    }

    @Query(returns => [HabitatModel], { nullable: true, description: "Get all habitats for user logged in", name: "habitat_getForUser" })
    userHabitats() {
        return this.habitatService.getHabitatsForLoggedIn();
    }

    @ResolveField()
    buildingZones(
        @Parent() habitat: HabitatModel
    ) {
        return this.buildingZoneService.getAllZonesForCurrentHabitat();
    }

    @ResolveField()
    buildingQueue(
        @Parent() habitat: HabitatModel
    ) {
        return this.buildingQueueFetchService.getCurrentBuildingQueueForHabitat(habitat.id);
    }
}