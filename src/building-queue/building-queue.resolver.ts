import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BuildingQueueAddService } from "@warp-core/building-queue/building-queue-add.service";
import { BuildingQueueHandlerService } from "@warp-core/building-queue/building-queue-handler.service";
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { AddToQueueValidator } from "@warp-core/building-queue/input/add-to-queue.validator";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";

@Resolver(of => BuildingQueueElementModel)
export class BuildingQueueResolver {
    constructor(
        private readonly buildingQueueAddService: BuildingQueueAddService,
        private readonly buildingQueueHandlerService: BuildingQueueHandlerService
    ) {}

    @Mutation(returns => BuildingQueueElementModel, { description: "Add to element queue", name: "buildingQueue_add" })
    addToQueue(
        @Args('addToQueue', AddToQueueValidator) addToQueue: AddToQueueInput
    ) {
        return this.buildingQueueAddService.addToQueue(addToQueue);
    }

    @ResolveField()
    building(
        @Parent() buildingQueueElement: BuildingQueueElementModel
    ) {
        return buildingQueueElement.building;
    }

    @ResolveField()
    buildingZone(
        @Parent() buildingQueueElement: BuildingQueueElementModel
    ) {
        return buildingQueueElement.buildingZone;
    }
}