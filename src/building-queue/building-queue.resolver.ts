import { Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { BuildingQueueAddService } from "@warp-core/building-queue/building-queue-add.service";
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { BuildingService } from "@warp-core/building/building.service";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";

@Resolver(of => BuildingQueueElementModel)
export class BuildingQueueResolver {
    constructor(
        private readonly buildingQueueAddService: BuildingQueueAddService,
        private readonly buildingService: BuildingService,
        private readonly buildingZoneService: BuildingZoneService,
    ) {}

    @Mutation(returns => BuildingQueueElementModel, { description: "Add to element queue", name: "buildingQueue_add" })
    addToQueue(
        @Args('addToQueue') addToQueue: AddToQueueInput
    ) {
        return this.buildingQueueAddService.addToQueue(addToQueue);
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
        return this.buildingZoneService.getSingleBuildingZone(buildingQueueElement.buildingZone.id);
    }
}