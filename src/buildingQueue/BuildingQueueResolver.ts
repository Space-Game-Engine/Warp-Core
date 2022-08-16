import {Service} from "typedi";
import {Arg, FieldResolver, Int, Mutation, Query, Resolver, Root} from "type-graphql";
import {BuildingQueueElement} from "./Models/BuildingQueueElement";
import {BuildingQueueService} from "./BuildingQueueService";
import {BuildingZoneService} from "../buildingZone/BuildingZoneService";
import {BuildingZone} from "../buildingZone/Models/BuildingZone";
import {BuildingService} from "../building/BuildingService";
import {AddToQueueInput} from "./InputTypes/AddToQueueInput";
import { BuildingQueueFetchService } from "./BuildingQueueFetchService";

@Service()
@Resolver(of => BuildingQueueElement)
export class BuildingQueueResolver {

    constructor(
        private readonly buildingQueueService: BuildingQueueService,
        private readonly buildingQueueFetch: BuildingQueueFetchService,
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingService: BuildingService,
    ) {
    }

    @Query(returns => [BuildingQueueElement], { description: "Returns whole unfinished queue for habitat", name: "buildingQueue_getForHabitat" })
    buildingQueueForHabitat(
        @Arg('habitatId', type => Int) habitatId: number
    ) {
        return this.buildingQueueFetch.getCurrentBuildingQueueForHabitat(habitatId);
    }

    @Query(returns => BuildingQueueElement, { description: "Returns single queue element", nullable: true, name: "buildingQueue_get" })
    buildingQueueElement(
        @Arg('queueElementId', type => Int) queueElementId: number
    ) {
        return this.buildingQueueFetch.getSingleBuildingQueueElementById(queueElementId);
    }

    @Mutation(returns => BuildingQueueElement, { description: "Adds element to building queue", name: "buildingQueue_create" })
    addToQueue(
        @Arg("addToQueueElement") addToQueueElement: AddToQueueInput
    ) {
        return this.buildingQueueService.addToQueue(addToQueueElement);
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
