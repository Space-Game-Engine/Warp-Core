import {Injectable} from '@nestjs/common';

import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingQueryEmitter} from '@warp-core/global/building';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {QueueInputValidation} from '@warp-core/user/queue/building-queue/input/validator/type';
import {AbstractValidateQueueElementService} from '@warp-core/user/queue/core';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';

@Injectable()
export class ValidateSingleQueueElementService extends AbstractValidateQueueElementService<
	AddToQueueInput,
	QueueInputValidation
> {
	constructor(
		protected readonly buildingZoneService: BuildingZoneEmitter,
		protected readonly buildingService: BuildingQueryEmitter,
	) {
		super();
	}

	protected async buildValidationContext(
		addToQueueInput: AddToQueueInput,
		validationError: QueueValidationError,
	): Promise<QueueInputValidation> {
		const buildingZone = await this.getBuildingZone(
			addToQueueInput,
			validationError,
		);
		const building = await this.getBuilding(
			addToQueueInput,
			buildingZone,
			validationError,
		);

		return {
			addToQueueInput,
			building,
			buildingZone,
			validationError,
		};
	}

	protected async getBuildingZone(
		addToQueue: AddToQueueInput,
		validationError: QueueValidationError,
	): Promise<BuildingZoneModel> {
		const {data: buildingZone} =
			await this.buildingZoneService.getSingleBuildingZone({
				localBuildingZoneId: addToQueue.localBuildingZoneId,
			});

		if (!buildingZone) {
			validationError.addError(
				'localBuildingZoneId',
				'Provided building zone does not exist.',
			);
			throw validationError;
		}

		return buildingZone;
	}

	protected async getBuilding(
		addToQueue: AddToQueueInput,
		buildingZone: BuildingZoneModel,
		validationError: QueueValidationError,
	): Promise<BuildingModel> {
		const buildingFromBuildingZone = await buildingZone.building;
		if (buildingFromBuildingZone) {
			return buildingFromBuildingZone;
		}

		if (!addToQueue.buildingId) {
			validationError.addError(
				'buildingId',
				'Building Id is required when current building zone does not have any building.',
			);
			throw validationError;
		}

		const {data: building} = await this.buildingService.getBuildingById(
			addToQueue.buildingId,
		);

		if (!building) {
			validationError.addError(
				'buildingId',
				'Provided building does not exist.',
			);
			throw validationError;
		}

		return building;
	}
}
