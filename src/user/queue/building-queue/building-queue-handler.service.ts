import {Injectable, Logger} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {QueueElementAfterProcessingEvent} from '@warp-core/user/queue/building-queue/event/queue-element-after-processing.event';
import {QueueElementBeforeProcessingEvent} from '@warp-core/user/queue/building-queue/event/queue-element-before-processing.event';

@Injectable()
export class BuildingQueueHandlerService {
	private readonly logger = new Logger(BuildingQueueHandlerService.name);

	constructor(
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
		private readonly eventEmitter: EventEmitter2,
	) {}

	public getQueueItemsForHabitat(): Promise<BuildingQueueElementModel[]> {
		return this.buildingQueueRepository.getCurrentBuildingQueueForHabitat(
			this.habitatModel.id,
		);
	}

	public async resolveQueue(): Promise<void> {
		this.logger.debug(`Resolving queue for habitat ${this.habitatModel.id}`);
		const notResolvedQueueItems =
			await this.buildingQueueRepository.getUnresolvedQueueForHabitat(
				this.habitatModel.id,
			);

		for (const buildingZone of await this.habitatModel.buildingZones) {
			await this.processMultipleQueueElements(
				notResolvedQueueItems.filter(
					queueItem => queueItem.buildingZoneId === buildingZone.id,
				),
				buildingZone,
			);
		}
	}

	public async resolveQueueForSingleBuildingZone(
		buildingZone: BuildingZoneModel,
	): Promise<void> {
		this.logger.debug(`Resolving queue for building zone ${buildingZone.id}`);
		const notResolvedQueueItems =
			await this.buildingQueueRepository.getUnresolvedQueueForSingleBuildingZone(
				buildingZone.id,
			);

		await this.processMultipleQueueElements(
			notResolvedQueueItems,
			buildingZone,
		);
	}

	private async processMultipleQueueElements(
		queueElements: BuildingQueueElementModel[],
		buildingZone: BuildingZoneModel,
	): Promise<void> {
		this.logger.debug(`${queueElements.length} queue elements to process`);
		for (const singleQueueElement of queueElements) {
			await this.processQueueElement(singleQueueElement, buildingZone);
		}
	}

	private async processQueueElement(
		queueElement: BuildingQueueElementModel,
		buildingZoneToProcess: BuildingZoneModel,
	): Promise<void> {
		this.logger.debug(
			`Processing queue element for building zone with id ${buildingZoneToProcess.id}`,
		);
		buildingZoneToProcess.level = queueElement.endLevel;

		if (!buildingZoneToProcess.buildingId) {
			buildingZoneToProcess.buildingId = (await queueElement.building)!.id;
		}

		queueElement.isConsumed = true;

		this.logger.debug(
			`Queue element processed/consumed for building zone with id ${queueElement.buildingZoneId}`,
		);

		this.buildingQueueRepository.disableEntityListeners([
			BuildingZoneModel,
			HabitatResourceModel,
		]);

		await this.eventEmitter.emitAsync(
			'building_queue.resolving.before_processing_element',
			new QueueElementBeforeProcessingEvent(queueElement),
		);

		await this.buildingZoneRepository.update(buildingZoneToProcess.id, {
			buildingId: buildingZoneToProcess.buildingId,
			level: buildingZoneToProcess.level,
		});
		await this.buildingQueueRepository.update(queueElement.id as number, {
			isConsumed: queueElement.isConsumed,
		});

		await this.eventEmitter.emitAsync(
			'building_queue.resolving.after_processing_element',
			new QueueElementAfterProcessingEvent(queueElement),
		);

		this.buildingQueueRepository.enableEntityListeners([
			BuildingZoneModel,
			HabitatResourceModel,
		]);
	}
}
