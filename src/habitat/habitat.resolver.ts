import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CurrentHabitat } from "../auth/decorator/get-current-habitat.decorator";
import { BuildingQueueFetchService } from "../building-queue/building-queue-fetch.service";
import { BuildingZoneService } from "../building-zone/building-zone.service";
import { HabitatService } from "./habitat.service";
import { HabitatModel } from "./model/habitat.model";

@Resolver(of => HabitatModel)
export class HabitatResolver {
    constructor(
        private readonly habitatService: HabitatService,
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingQueueFetchService: BuildingQueueFetchService
    ) { }

    @Query(returns => HabitatModel, { nullable: true, description: "Get single habitat by its id", name: "habitat_get" })
    habitat(
        @CurrentHabitat() habitat: HabitatModel
    ) {
        return this.habitatService.getHabitatById(habitat.id);
    }

    @Query(returns => [HabitatModel], { nullable: true, description: "Get all habitats for single user id", name: "habitat_getForUser" })
    userHabitats(
        @CurrentHabitat() habitat: HabitatModel
    ) {
        return this.habitatService.getHabitatsByUserId(habitat.userId);
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