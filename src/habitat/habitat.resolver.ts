import { Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { ResourcesService } from "@warp-core/resources/resources.service";
import { HabitatService } from "./habitat.service";
import { BuildingQueueRepository, HabitatModel, HabitatResourceCombined } from "@warp-core/database";

@Resolver(of => HabitatModel)
export class HabitatResolver {
    constructor(
        private readonly habitatService: HabitatService,
        private readonly buildingQueueRepository: BuildingQueueRepository,
        private readonly resourcesService: ResourcesService
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
        return habitat.buildingZones;
    }

    @ResolveField()
    buildingQueue(
        @Parent() habitat: HabitatModel
    ) {
        return this.buildingQueueRepository.getCurrentBuildingQueueForHabitat(habitat.id);
    }

    @ResolveField(() => [HabitatResourceCombined])
    resources(
        @Parent() habitat: HabitatModel
    ) {
        return this.resourcesService.getAllResourcesForHabitat(habitat);
    }
}