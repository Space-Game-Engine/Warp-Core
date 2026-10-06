import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BuildingQueryEmitter} from '@warp-core/global/building';
import {BuildingQueueResourceConsumerInterface} from '@warp-core/user/queue/building-queue/add/calculate-resources/building-queue-resource-consumer.interface';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {AbstractPrepareQueueElementService} from '@warp-core/user/queue/core';
import {QueueError} from '@warp-core/user/queue/core/exception/queue.error';

@Injectable()
export class PrepareSingleBuildingQueueElementService extends AbstractPrepareQueueElementService<
	AddToQueueInput,
	BuildingQueueElementModel
> {
	constructor(
		protected readonly calculationService: BuildingQueueResourceConsumerInterface,
		protected readonly buildingQueueRepository: BuildingQueueRepository,
		protected readonly buildingZoneRepository: BuildingZoneRepository,
		protected readonly buildingService: BuildingQueryEmitter,
		protected readonly habitatModel: AuthorizedHabitatModel,
	) {
		super(buildingQueueRepository);
	}

	protected async createDraftQueueElement(
		addToQueueElement: AddToQueueInput,
	): Promise<BuildingQueueElementModel> {
		const buildingZone =
			(await this.buildingZoneRepository.getSingleBuildingZone(
				addToQueueElement.localBuildingZoneId,
				this.habitatModel.id,
			)) as BuildingZoneModel;

		let building = await buildingZone.building;

		if (!building) {
			building = await this.getBuildingById(addToQueueElement.buildingId!);
		}

		const resourceCost = await this.calculationService.calculateResourcesCosts(
			addToQueueElement,
			buildingZone,
			building,
		);

		return this.buildingQueueRepository.create({
			id: null,
			buildingId: building.id,
			buildingZone: buildingZone,
			buildingZoneId: buildingZone.id,
			startTime: new Date(),
			startLevel: buildingZone.level,
			endLevel: addToQueueElement.endLevel,
			endTime: new Date(),
			isConsumed: false,
			costs: resourceCost,
		});
	}

	protected async calculateUpgradeTimeInSeconds(
		queueElement: BuildingQueueElementModel,
	): Promise<number> {
		const {data: upgradeTime, error} =
			await this.buildingService.calculateTimeInSecondsToUpgradeBuilding({
				startLevel: queueElement.startLevel,
				endLevel: queueElement.endLevel,
				buildingId: queueElement.buildingId!,
			});

		if (error) {
			throw new InternalEmitterError(error.message);
		}

		return upgradeTime ?? 0;
	}

	private async getBuildingById(buildingId: string): Promise<BuildingModel> {
		const {data, error} = await this.buildingService.getBuildingById(buildingId);

		if (error) {
			throw new InternalEmitterError(error.message);
		}

		if (!data) {
			throw new QueueError('Failed to get building');
		}

		return data;
	}
}
