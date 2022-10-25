import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BuildingZoneService } from "../building-zone/building-zone.service";
import { HabitatService } from "./habitat.service";
import { NewHabitatInput } from "./input/NewHabitatInput";
import { HabitatModel } from "./model/habitat.model";

@Resolver(of => HabitatModel)
export class HabitatResolver {
    constructor(
        private readonly habitatService: HabitatService,
        private readonly buildingZoneService: BuildingZoneService
    ) { }

    @Query(returns => HabitatModel, { nullable: true, description: "Get single habitat by its id", name: "habitat_get" })
    habitat(
        @Args("id", {type: () => Int}) id: number
    ) {
        return this.habitatService.getHabitatById(id);
    }

    @Query(returns => [HabitatModel], { nullable: true, description: "Get all habitats for single user id", name: "habitat_getForUser" })
    userHabitats(
        @Args("userId", {type: () => Int}) id: number
    ) {
        return this.habitatService.getHabitatsByUserId(id);
    }

    @Mutation(returns => HabitatModel, { description: "Create new habitat for single user", name: "habitat_create" })
    addHabitat(
        @Args('newHabitatData') newHabitatData: NewHabitatInput
    ) {
        return this.habitatService.createNewHabitat(newHabitatData);
    }

    @ResolveField()
    buildingZones(
        @Parent() habitat: HabitatModel
    ) {
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(habitat.id);
    }

    // @ResolveField()
    // buildingQueue(
    //     @Parent() habitat: HabitatModel
    // ) {
    //     return this.buildingQueueFetch.getCurrentBuildingQueueForHabitat(habitat.id);
    // }
}