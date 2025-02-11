import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {QueueInputValidationEvent} from '@warp-core/user/queue/building-queue/event/queue-input-validation.event';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

@Injectable()
export class ConfigurationValidator {
	constructor(
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly runtimeConfig: RuntimeConfig,
	) {}

	@OnEvent('building_queue.validating.add_to_queue')
	@OnEvent('building_queue.validating.draft_queue_element')
	public async validate(
		queueValidationEvent: QueueInputValidationEvent,
	): Promise<void> {
		const addToQueueElement = queueValidationEvent.addToQueueInput;
		const buildingZone = queueValidationEvent.buildingZone;

		if (
			this.runtimeConfig.habitat.buildingQueue.allowMultipleLevelUpdate === true
		) {
			const errorMessage = await this.isPossibleToQueueElementByMultipleLevels(
				addToQueueElement,
				buildingZone,
			);
			if (errorMessage) {
				queueValidationEvent.addError('endLevel', errorMessage);
			}
		} else {
			if (
				(await this.isPossibleToQueueElementByOneLevel(
					addToQueueElement,
					buildingZone,
				)) === false
			) {
				queueValidationEvent.addError(
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
