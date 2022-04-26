import {
    Resolver,
    Query,
    Arg,
    Mutation,
} from "type-graphql";
import { Service } from "typedi";
import { Building } from "./Models/Building";
import { BuildingService } from "./BuildingService";
import { BuildingInput } from "./InputTypes/BuildingInput";

@Service()
@Resolver(Building)
export class BuildingResolver {
    constructor(
        private readonly buildingService: BuildingService
    ) { }

    @Query(returns => Building, { nullable: true, description: "Returns single building type" })
    building(
        @Arg("id") id: number
    ) {
        return this.buildingService.getBuildingById(id);
    }

    @Query(returns => [Building], { nullable: true, description: "Returns all possible building types" })
    allBuildings() {
        return this.buildingService.getAllBuildings();
    }

    @Mutation(returns => Building, { description: "Create new building type" })
    createNewBuildingType(
        @Arg('buildingData') buildingData: BuildingInput
    ) {
        return this.buildingService.createNewBuilding(buildingData);
    }

    @Mutation(returns => Building, { description: "Edit existing building" })
    editBuildingType(
        @Arg("id") id: number,
        @Arg('buildingData') buildingData: BuildingInput
    ) {
        return this.buildingService.editBuilding(id, buildingData);
    }
}