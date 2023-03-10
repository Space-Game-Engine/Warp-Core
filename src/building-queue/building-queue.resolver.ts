import { Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { BuildingQueueElementModel } from "./model/building-queue-element.model";
import { AddToQueueInput } from "./input/add-to-queue.input";
import { BuildingQueueAddService } from "./building-queue-add.service";
import { BuildingService } from "../building/building.service";
import { BuildingZoneService } from "../building-zone/building-zone.service";
import { CurrentHabitat } from "../auth/decorator/get-current-habitat.decorator";
import { HabitatModel } from "../database/model/habitat.model";

@Resolver(of => BuildingQueueElementModel)
export class BuildingQueueResolver {
    constructor(
        private readonly buildingQueueAddService: BuildingQueueAddService,
        private readonly buildingService: BuildingService,
        private readonly buildingZoneService: BuildingZoneService,
    ) {}

    @Mutation(returns => BuildingQueueElementModel, { description: "Add to element queue", name: "buildingQueue_add" })
    addToQueue(
        @Args('addToQueue') addToQueue: AddToQueueInput,
        @CurrentHabitat() habitat: HabitatModel
    ) {
        return this.buildingQueueAddService.addToQueue(addToQueue, habitat);
    }

    @ResolveField()
    building(
        @Parent() buildingQueueElement: BuildingQueueElementModel
    ) {
        return this.buildingService.getBuildingById(buildingQueueElement.building.id);
    }

    @ResolveField()
    buildingZone(
        @Parent() buildingQueueElement: BuildingQueueElementModel
    ) {
        return this.buildingZoneService.getSingleBuildingZoneById(buildingQueueElement.buildingZone.id);
    }
}