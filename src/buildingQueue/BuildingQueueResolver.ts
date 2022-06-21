import {Service} from "typedi";
import {Arg, FieldResolver, Int, Query, Resolver, Root} from "type-graphql";
import {BuildingQueueElement} from "./Models/BuildingQueueElement";
import {BuildingQueueService} from "./BuildingQueueService";
import {BuildingZoneService} from "../buildingZone/BuildingZoneService";
import {BuildingZone} from "../buildingZone/Models/BuildingZone";
import {BuildingService} from "../building/BuildingService";

@Service()
@Resolver(of => BuildingQueueElement)
export class BuildingQueueResolver {

    constructor(
        private readonly buildingQueueService: BuildingQueueService,
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingService: BuildingService,
    ) {
    }

    @Query(returns => [BuildingQueueElement], {description: "Returns whole queue for habitat"})
    buildingQueueForHabitat(
        @Arg('habitatId', type => Int) habitatId: number
    ) {
        return this.buildingQueueService.getBuildingQueueForHabitat(habitatId);
    }

    @FieldResolver()
    buildingZone(
        @Root() buildingQueueElement: BuildingQueueElement
    ) {
        return this.buildingZoneService.getSingleBuildingZoneById(buildingQueueElement.buildingZoneId);
    }

    @FieldResolver()
    building(
        @Root() buildingZone: BuildingZone
    ) {

        return this.buildingService.getBuildingById(buildingZone.buildingId);
    }

}
