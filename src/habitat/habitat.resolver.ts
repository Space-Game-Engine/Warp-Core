import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { HabitatService } from "./habitat.service";

@Resolver(of => HabitatModel)
export class HabitatResolver {
    constructor(
        private readonly habitatService: HabitatService,
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingQueueRepository: BuildingQueueRepository
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
        return this.buildingQueueRepository.getCurrentBuildingQueueForHabitat(habitat.id);
    }
}