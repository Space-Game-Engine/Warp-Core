import {Arg, FieldResolver, Mutation, Query, Resolver, Root,} from "type-graphql";
import {Service} from "typedi";
import {BuildingZoneService} from "../buildingZone/BuildingZoneService";

import {Habitat} from "./Models/Habitat";
import {HabitatService} from "./HabitatService";
import {NewHabitatInput} from "./InputTypes/NewHabitatInput";

@Service()
@Resolver(of => Habitat)
export class HabitatResolver {
    constructor(
        private readonly habitatService: HabitatService,
        private readonly buildingZoneService: BuildingZoneService,
    ) {
    }

    @Query(returns => Habitat, {nullable: true, description: "Get single habitat by its id"})
    habitat(
        @Arg("id") id: number
    ) {
        return this.habitatService.getHabitatById(id);
    }

    @Query(returns => [Habitat], { nullable: true, description: "Get all habitats for single user id" })
    userHabitats(
        @Arg("userId") id: number
    ) {
        return this.habitatService.getHabitatsByUserId(id);
    }

    @Mutation(returns => Habitat, { description: "Create new habitat for single user" })
    async addHabitat(
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
}
