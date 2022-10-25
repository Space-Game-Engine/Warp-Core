import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { BuildingService } from "./building.service";
import { BuildingModel } from "./model/building.model";

@Resolver(of => BuildingModel)
export class BuildingResolver {
    constructor(
        private readonly buildingService: BuildingService
    ) { }

    @Query(returns => BuildingModel, { nullable: true, description: "Returns single building type", name: "building_get" })
    building(
        @Args('id', { type: () => Int }) id: number
    ) {
        return this.buildingService.getBuildingById(id);
    }

    @Query(returns => [BuildingModel], { nullable: true, description: "Returns all possible building types", name: "building_getAll" })
    allBuildings() {
        return this.buildingService.getAllBuildings();
    }
}