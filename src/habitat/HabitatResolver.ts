import {Arg, FieldResolver, Int, Mutation, Query, Resolver, Root,} from "type-graphql";
import {Service} from "typedi";
import {BuildingZoneService} from "../buildingZone/BuildingZoneService";

import {Habitat} from "./Models/Habitat";
import {HabitatService} from "./HabitatService";
import {NewHabitatInput} from "./InputTypes/NewHabitatInput";
import { BuildingQueueFetchService } from "../buildingQueue/BuildingQueueFetchService";

@Service()
@Resolver(of => Habitat)
export class HabitatResolver {
    constructor(
        private readonly habitatService: HabitatService,
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingQueueFetch: BuildingQueueFetchService,
    ) {
    }

    @Query(returns => Habitat, { nullable: true, description: "Get single habitat by its id", name: "habitat_get" })
    habitat(
        @Arg("id", type => Int) id: number
    ) {
        return this.habitatService.getHabitatById(id);
    }

    @Query(returns => [Habitat], { nullable: true, description: "Get all habitats for single user id", name: "habitat_getForUser" })
    userHabitats(
        @Arg("userId", type => Int) id: number
    ) {
        return this.habitatService.getHabitatsByUserId(id);
    }

    @Mutation(returns => Habitat, { description: "Create new habitat for single user", name: "habitat_create" })
    addHabitat(
        @Arg('newHabitatData') newHabitatData: NewHabitatInput
    ) {
        return this.habitatService.createNewHabitat(newHabitatData);
    }

    @FieldResolver()
    buildingZones(
        @Root() habitat: Habitat
    ) {
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(habitat.id);
    }

    @FieldResolver()
    buildingQueue(
        @Root() habitat: Habitat
    ) {
        return this.buildingQueueFetch.getCurrentBuildingQueueForHabitat(habitat.id);
    }
}
