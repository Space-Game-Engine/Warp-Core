import {Injectable} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';

import {CustomValidator} from '@warp-core/core';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingQueryEmitter} from '@warp-core/global/building';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone/exchange';
import {QueueInputValidationEvent} from '@warp-core/user/queue/building-queue/event/queue-input-validation.event';
import {QueueValidationError} from '@warp-core/user/queue/building-queue/exception/queue-validation.error';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

@Injectable()
export abstract class AbstractNewQueueElementValidator extends CustomValidator<AddToQueueInput> {
	constructor(
		protected readonly buildingZoneService: BuildingZoneEmitter,
		protected readonly buildingService: BuildingQueryEmitter,
		protected readonly eventEmitter: EventEmitter2,
	) {
		super();
	}

	protected async customValidator(
		addToQueue: AddToQueueInput,
	): Promise<boolean> {
		const buildingZone = await this.getBuildingZone(addToQueue);
		const building = await this.getBuilding(addToQueue, buildingZone);

		const queueInputValidatorEvent = new QueueInputValidationEvent(
			addToQueue,
			building,
			buildingZone,
		);

		await this.eventEmitter.emitAsync(
			this.getEventName(),
			queueInputValidatorEvent,
		);

		if (queueInputValidatorEvent.hasError()) {
			throw new QueueValidationError(queueInputValidatorEvent.queueErrors);
		}

		return true;
	}

	protected abstract getEventName(): string;

	protected async getBuildingZone(
		addToQueue: AddToQueueInput,
	): Promise<BuildingZoneModel> {
		const {data: buildingZone} =
			await this.buildingZoneService.getSingleBuildingZone({
				localBuildingZoneId: addToQueue.localBuildingZoneId,
			});

		if (!buildingZone) {
			throw new QueueValidationError({
				localBuildingZoneId: ['Provided building zone does not exist.'],
			});
		}

		return buildingZone;
	}

	protected async getBuilding(
		addToQueue: AddToQueueInput,
		buildingZone: BuildingZoneModel,
	): Promise<BuildingModel> {
		const buildingFromBuildingZone = await buildingZone.building;
		if (buildingFromBuildingZone) {
			return buildingFromBuildingZone;
		}

		if (!addToQueue.buildingId) {
			throw new QueueValidationError({
				buildingId: [
					'Building Id is required when current building zone does not have any building.',
				],
			});
		}

		const {data: building} = await this.buildingService.getBuildingById(
			addToQueue.buildingId,
		);

		if (!building) {
			throw new QueueValidationError({
				buildingId: ['Provided building does not exist.'],
			});
		}

		return building;
	}
}
