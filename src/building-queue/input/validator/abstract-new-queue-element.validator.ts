import {CustomValidator} from "@warp-core/core";
import {AddToQueueInput} from "@warp-core/building-queue/input/add-to-queue.input";
import {BuildingZoneService} from "@warp-core/building-zone/building-zone.service";
import {BuildingService} from "@warp-core/building";
import {EventEmitter2} from "@nestjs/event-emitter";
import {QueueInputValidationEvent} from "@warp-core/building-queue/event/queue-input-validation.event";
import {QueueValidationError} from "@warp-core/building-queue/exception/queue-validation.error";
import {BuildingModel, BuildingZoneModel} from "@warp-core/database";
import {Injectable} from "@nestjs/common";

@Injectable()
export abstract class AbstractNewQueueElementValidator extends CustomValidator<AddToQueueInput> {
    constructor(
        protected readonly buildingZoneService: BuildingZoneService,
        protected readonly buildingService: BuildingService,
        protected readonly eventEmitter: EventEmitter2,
    ) {
        super();
    }

    protected async customValidator(addToQueue: AddToQueueInput): Promise<boolean> {
        const buildingZone = await this.getBuildingZone(addToQueue);
        const building = await this.getBuilding(addToQueue, buildingZone);

        const queueInputValidatorEvent = new QueueInputValidationEvent(
            addToQueue,
            building,
            buildingZone
        );

        await this.eventEmitter.emitAsync(this.getEventName(), queueInputValidatorEvent);

        if (queueInputValidatorEvent.hasError()) {
            throw new QueueValidationError(queueInputValidatorEvent.queueErrors);
        }

        return true;
    }

    protected abstract getEventName(): string;

    protected async getBuildingZone(addToQueue: AddToQueueInput): Promise<BuildingZoneModel> {
        const buildingZone = await this.buildingZoneService
            .getSingleBuildingZone(
                addToQueue.localBuildingZoneId
            );

        if (!buildingZone) {
            throw new QueueValidationError({localBuildingZoneId: ['Provided building zone does not exist.']});
        }

        return buildingZone;
    }

    protected async getBuilding(addToQueue: AddToQueueInput, buildingZone: BuildingZoneModel): Promise<BuildingModel> {
        const buildingFromBuildingZone = await buildingZone.building;
        if (buildingFromBuildingZone) {
            return buildingFromBuildingZone;
        }

        if (!addToQueue.buildingId) {
            throw new QueueValidationError({buildingId: ['Building Id is required when current building zone does not have any building.']});
        }

        const building = await this.buildingService.getBuildingById(addToQueue.buildingId);

        if (!building) {
            throw new QueueValidationError({buildingId: ['Provided building does not exist.']});
        }

        return building;
    }
}