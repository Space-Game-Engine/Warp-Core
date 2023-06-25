import {Injectable, Logger} from "@nestjs/common";
import {QueueElementProcessedEvent} from "@warp-core/building-queue";
import {AuthorizedHabitatModel} from "@warp-core/auth";
import {OnEvent} from "@nestjs/event-emitter";
import {QueueElementCostModel} from "@warp-core/database/model/queue-element-cost.model";
import {HabitatResourceModel} from "@warp-core/database";
import {InsufficientResourceType} from "@warp-core/resources/exception/insufficient-resource.type";
import {InsufficientResourcesException} from "@warp-core/resources/exception/Insufficient-resources.exception";

@Injectable()
export class ResourceExtractorService {
    private readonly logger = new Logger(ResourceExtractorService.name);

    constructor(
        private readonly habitatModel: AuthorizedHabitatModel,
    ) {}

    @OnEvent('building_queue.adding.after_processing_element')
    async useResourcesOnQueueUpdate(queueProcessingEvent: QueueElementProcessedEvent) {
        const queueElement = queueProcessingEvent.queueElement;
        const requiredResources = await this.getRequiredResourcesFromHabitat(queueElement.costs);
        const errors = this.validateResources(queueElement.costs, requiredResources);

        if (errors.length > 0) {
            throw new InsufficientResourcesException(errors);
        }

        //TODO: use resources
    }

    async getRequiredResourcesFromHabitat(queueCost: QueueElementCostModel[]): Promise<HabitatResourceModel[]> {
        const habitatResources = await this.habitatModel.habitatResources;

        return habitatResources.filter((singleResource) => {
           return queueCost.find(
               (cost) => cost.resource.id === singleResource.resourceId
           );
        });
    }

    validateResources(queueCost: QueueElementCostModel[], requiredResources: HabitatResourceModel[]): InsufficientResourceType[] {
        const errors: InsufficientResourceType[] = [];

        for (const singleCost of queueCost) {
            const habitatResourceModel = requiredResources.find(
                (singleResource) => singleResource.resourceId === singleCost.resource.id
            );

            if (habitatResourceModel.currentAmount < singleCost.cost) {
                const difference = singleCost.cost - habitatResourceModel.currentAmount;
                errors.push({
                    resourceId: singleCost.resource.id,
                    resourceName: singleCost.resource.name,
                    requiredResources: singleCost.cost,
                    currentResources: habitatResourceModel.currentAmount,
                    difference: difference
                });
            }
        }

        return errors;
    }


}

