import {Injectable} from '@nestjs/common';

import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingQueryEmitter} from '@warp-core/global/building';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone';
import {QueueValidationError} from '@warp-core/user/queue/building-queue/exception/queue-validation.error';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/building-queue/input/validator/queue-item-validator.interface';

@Injectable()
export class ValidateSingleQueueElementService {
	constructor(
		protected readonly buildingZoneService: BuildingZoneEmitter,
		protected readonly buildingService: BuildingQueryEmitter,
	) {}

	public async validateQueueItem(input: {
		addToQueueInput: AddToQueueInput;
		validators: QueueItemValidatorInterface[];
	}): Promise<true | never> {
		const {addToQueueInput, validators} = input;
		const validationError = new QueueValidationError();
		const buildingZone = await this.getBuildingZone(
			addToQueueInput,
			validationError,
		);
		const building = await this.getBuilding(
			addToQueueInput,
			buildingZone,
			validationError,
		);

		await Promise.all(
			validators.map(singleValidator =>
				singleValidator.validate({
					addToQueueInput,
					building,
					buildingZone,
					validationError,
				}),
			),
		);

		if (validationError.hasErrors()) {
			throw validationError;
		}

		return true;
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
