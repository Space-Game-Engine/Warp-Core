import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CurrentHabitat } from "../auth/decorator/get-current-habitat.decorator";
import { BuildingQueueFetchService } from "../building-queue/building-queue-fetch.service";
import { BuildingZoneService } from "../building-zone/building-zone.service";
import { HabitatService } from "./habitat.service";
import { HabitatModel } from "../database/model/habitat.model";

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
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(habitat.id);
    }

    @ResolveField()
    buildingQueue(
        @Parent() habitat: HabitatModel
    ) {
        return this.buildingQueueFetchService.getCurrentBuildingQueueForHabitat(habitat.id);
    }
}