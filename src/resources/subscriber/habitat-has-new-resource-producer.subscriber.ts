import {Injectable, Logger} from "@nestjs/common";
import {QueueElementProcessedEvent} from "@warp-core/building-queue";
import {OnEvent} from "@nestjs/event-emitter";
import {
    BuildingQueueElementModel,
    BuildingZoneRepository,
    HabitatResourceModel,
    HabitatResourceRepository
} from "@warp-core/database";
import {AuthorizedHabitatModel} from "@warp-core/auth";

@Injectable()
export class HabitatHasNewResourceProducerSubscriber {
    private readonly logger = new Logger(HabitatHasNewResourceProducerSubscriber.name);

    constructor(
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly habitatResourceRepository: HabitatResourceRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
    ) {}

    @OnEvent('building_queue.resolving.before_processing_element')
    async updateLastCalculationDateOnHabitatResource(queueProcessingEvent: QueueElementProcessedEvent, transactionId: string) {
        const queueElement = queueProcessingEvent.queueElement;

        this.logger.debug("Checking habitat resources");

        const habitatResources = await this.getProducedResourcesListForQueueElement(queueElement);

        if (habitatResources.length === 0) {
            this.logger.debug("No habitat resource to update");
            return;
        }

        this.logger.debug(`Got ${habitatResources.length} habitat resources to update`);

        const entityManager = this.habitatResourceRepository.getSharedTransaction(transactionId);

        for (const singleHabitatResource of habitatResources) {
            singleHabitatResource.lastCalculationTime = new Date();

            await entityManager.update(HabitatResourceModel, singleHabitatResource.id, {
                lastCalculationTime: singleHabitatResource.lastCalculationTime,
            });
        }

        this.logger.debug("Last calculation times from habitat resources updated");
    }

    private async getProducedResourcesListForQueueElement(queueElement: BuildingQueueElementModel): Promise<HabitatResourceModel[]> {
        const building = await queueElement.building;

        const habitatResourceModels = await this.habitatResourceRepository.getHabitatResourceByBuildingAndLevel(
            building,
            queueElement.endLevel,
            this.habitatModel.id
        );

        return habitatResourceModels
            .filter((habitatResource) => habitatResource.lastCalculationTime === null);
    }
}