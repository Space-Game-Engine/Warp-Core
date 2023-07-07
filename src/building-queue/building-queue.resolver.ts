import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BuildingQueueAddService } from "@warp-core/building-queue/add/building-queue-add.service";
import { BuildingQueueHandlerService } from "@warp-core/building-queue/building-queue-handler.service";
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { AddToQueueValidator } from "@warp-core/building-queue/input/validator/add-to-queue.validator";
import { BuildingQueueElementModel } from "@warp-core/database";
import {DraftModelInterface} from "@warp-core/core/utils/model";
import {ResourceConsumerResolverInterface} from "@warp-core/core/utils";
import {BuildingQueueDraftService} from "@warp-core/building-queue/add/building-queue-draft.service";
import {DraftQueueElementValidator} from "@warp-core/building-queue/input/validator/draft-queue-element.validator";

@Resolver(of => BuildingQueueElementModel)
export class BuildingQueueResolver implements ResourceConsumerResolverInterface {
    constructor(
        private readonly buildingQueueAddService: BuildingQueueAddService,
        private readonly buildingQueueDraftService: BuildingQueueDraftService,
        private readonly buildingQueueHandlerService: BuildingQueueHandlerService
    ) {}

    @Mutation(returns => BuildingQueueElementModel, { description: "Add to element queue and consume related resources", name: "buildingQueue_add" })
    processAndConsumeResources(
        @Args('addToQueue', AddToQueueValidator) addToQueue: AddToQueueInput
    ) {
        return this.buildingQueueAddService.processAndConsumeResources(addToQueue);
    }

    @Mutation(returns => BuildingQueueElementModel, { description: "Prepare a draft of a queue element", name: "buildingQueue_getDraft" })
    getDraft(
        @Args('addToQueue', DraftQueueElementValidator) addToQueue: AddToQueueInput
    ): Promise<DraftModelInterface> {
        return this.buildingQueueDraftService.getDraft(addToQueue);
    }

    @Query(returns => [BuildingQueueElementModel], { description: "Checks all items in queue, recalculate them and return current items from queue", name: "buildingQueue_getAll" })
    async getQueueItems() {
        await this.buildingQueueHandlerService.resolveQueue();

        return this.buildingQueueHandlerService.getQueueItemsForHabitat();
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