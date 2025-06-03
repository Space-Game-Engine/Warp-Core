import {Injectable} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/building-queue/input/validator/queue-item-validator.interface';
import {QueueInputValidation} from '@warp-core/user/queue/building-queue/input/validator/type';

@Injectable()
export class ConfigurationValidator implements QueueItemValidatorInterface {
	constructor(
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly runtimeConfig: RuntimeConfig,
	) {}

	public async validate({
		addToQueueInput,
		buildingZone,
		validationError,
	}: QueueInputValidation): Promise<void> {
		if (this.runtimeConfig.habitat.buildingQueue.allowMultipleLevelUpdate) {
			const errorMessage = await this.isPossibleToQueueElementByMultipleLevels(
				addToQueueInput,
				buildingZone,
			);
			if (errorMessage) {
				validationError.addError('endLevel', errorMessage);
			}
		} else {
			const isPossibleToQueueElementByOneLevel =
				await this.isPossibleToQueueElementByOneLevel(
					addToQueueInput,
					buildingZone,
				);
			if (!isPossibleToQueueElementByOneLevel) {
				validationError.addError(
					'endLevel',
					'You can only upgrade a building by one level at a time',
				);
			}
		}
	}

	private async isPossibleToQueueElementByOneLevel(
		addToQueueElement: AddToQueueInput,
		buildingZone: BuildingZoneModel,
	): Promise<boolean> {
		return addToQueueElement.endLevel - 1 <= buildingZone.level;
	}

	private async isPossibleToQueueElementByMultipleLevels(
		addToQueueElement: AddToQueueInput,
		buildingZone: BuildingZoneModel,
	): Promise<string | null> {
		const currentBuildingQueue =
			await this.buildingQueueRepository.getCurrentBuildingQueueForBuildingZone(
				buildingZone,
			);
		const latestQueueElement = currentBuildingQueue.at(-1);

		if (!latestQueueElement) {
			return null;
		}

		if (latestQueueElement.endLevel >= addToQueueElement.endLevel) {
			return 'New queue element should have end level higher than last queue element';
		}

		return null;
	}
}
