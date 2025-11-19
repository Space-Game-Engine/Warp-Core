import {Injectable, Logger} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BuildingQueueProcessingEmitter} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue-processing.emitter';

@Injectable()
export class BuildingQueueHandlerService {
	private readonly logger = new Logger(BuildingQueueHandlerService.name);

	constructor(
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
		private readonly buildingQueueEmitter: BuildingQueueProcessingEmitter,
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

		await this.buildingQueueEmitter.beforeProcessing({queueElement});

		await this.buildingZoneRepository.update(buildingZoneToProcess.id, {
			buildingId: buildingZoneToProcess.buildingId,
			level: buildingZoneToProcess.level,
		});
		await this.buildingQueueRepository.update(queueElement.id as number, {
			isConsumed: queueElement.isConsumed,
		});

		await this.buildingQueueEmitter.afterProcessing({queueElement});
	}
}
