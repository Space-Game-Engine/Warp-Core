import { Injectable } from '@nestjs/common';
import { AddToQueueInput } from '@warp-core/building-queue/input/add-to-queue.input';
import { BuildingZoneService } from '@warp-core/building-zone';
import { BuildingService } from "@warp-core/building";
import { CustomValidator } from '@warp-core/core';
import { BuildingModel, BuildingZoneModel } from '@warp-core/database';
import {EventEmitter2} from "@nestjs/event-emitter";
import {QueueValidationError} from "@warp-core/building-queue/exception/queue-validation.error";
import {QueueInputValidationEvent} from "@warp-core/building-queue/event/queue-input-validation.event";

@Injectable()
export class AddToQueueValidator extends CustomValidator<AddToQueueInput> {
    constructor(
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingService: BuildingService,
        private readonly eventEmitter: EventEmitter2,
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

        await this.eventEmitter.emitAsync('building_queue.validating.add_to_queue', queueInputValidatorEvent);

        if (queueInputValidatorEvent.hasError()) {
            throw new QueueValidationError(queueInputValidatorEvent.queueErrors);
        }

        return true;
    }

    private async getBuildingZone(addToQueue: AddToQueueInput): Promise<BuildingZoneModel> {
        const buildingZone = await this.buildingZoneService
            .getSingleBuildingZone(
                addToQueue.localBuildingZoneId
            );

        if (!buildingZone) {
            throw new QueueValidationError({localBuildingZoneId: ['Provided building zone does not exist.']});
        }

        return buildingZone;
    }

    private async getBuilding(addToQueue: AddToQueueInput, buildingZone: BuildingZoneModel): Promise<BuildingModel> {
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