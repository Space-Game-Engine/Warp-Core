import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BuildingQueueProcessingEmitter} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue-processing.emitter';
import {AbstractQueueHandlerService} from '@warp-core/user/queue/core';

@Injectable()
export class BuildingQueueHandlerService extends AbstractQueueHandlerService<BuildingQueueElementModel> {
	constructor(
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly buildingZoneRepository: BuildingZoneRepository,
		habitatModel: AuthorizedHabitatModel,
		buildingQueueEmitter: BuildingQueueProcessingEmitter,
	) {
		super(buildingQueueRepository, habitatModel, buildingQueueEmitter);
	}

	public async resolveQueueForSingleBuildingZone(
		buildingZone: BuildingZoneModel,
	): Promise<void> {
		this.logger.debug(`Resolving queue for building zone ${buildingZone.id}`);
		const notResolvedQueueItems =
			await this.buildingQueueRepository.getUnresolvedQueueForSingleBuildingZone(
				buildingZone.id,
			);

		for (const singleQueueElement of notResolvedQueueItems) {
			await this.processQueueElement(singleQueueElement);
		}
	}

	protected async applyQueueElement(
		queueElement: BuildingQueueElementModel,
	): Promise<void> {
		const buildingZone = await queueElement.buildingZone;

		this.logger.debug(
			`Processing queue element for building zone with id ${buildingZone.id}`,
		);

		buildingZone.level = queueElement.endLevel;

		if (!buildingZone.buildingId) {
			buildingZone.buildingId = (await queueElement.building)!.id;
		}

		await this.buildingZoneRepository.update(buildingZone.id, {
			buildingId: buildingZone.buildingId,
			level: buildingZone.level,
		});
	}
}
