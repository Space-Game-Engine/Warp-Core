import {Inject, Injectable} from '@nestjs/common';
import {DateTime} from 'luxon';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BuildingQueryEmitter} from '@warp-core/global/building';
import {ResourcesCalculatorInterface} from '@warp-core/user/queue/building-queue/add/calculate-resources/resources-calculator.interface';
import {QueueError} from '@warp-core/user/queue/building-queue/exception/queue.error';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

@Injectable()
export class PrepareSingleBuildingQueueElementService {
	constructor(
		@Inject('QUEUE_ADD_CALCULATION')
		protected readonly calculationService: ResourcesCalculatorInterface,
		protected readonly buildingQueueRepository: BuildingQueueRepository,
		protected readonly buildingZoneRepository: BuildingZoneRepository,
		protected readonly buildingService: BuildingQueryEmitter,
		protected readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async getQueueElement(
		addToQueueElement: AddToQueueInput,
	): Promise<BuildingQueueElementModel> {
		const buildingZone =
			(await this.buildingZoneRepository.getSingleBuildingZone(
				addToQueueElement.localBuildingZoneId,
				this.habitatModel.id,
			)) as BuildingZoneModel;

		let building = await buildingZone.building;

		if (!building) {
			const {data, error} = await this.buildingService.getBuildingById(
				addToQueueElement.buildingId!,
			);

			if (error) {
				throw new InternalEmitterError(error.message);
			}

			if (!data) {
				throw new QueueError('Failed to get building');
			}

			building = data;
		}

		const resourceCost = await this.calculationService.calculateResourcesCosts(
			addToQueueElement,
			buildingZone,
			building,
		);

		const startTime = await this.prepareStartTimeForQueueElement(buildingZone);
		const queueElement: BuildingQueueElementModel = {
			id: null,
			buildingId: building.id,
			buildingZone: buildingZone,
			buildingZoneId: buildingZone.id,
			startTime: startTime,
			startLevel: buildingZone.level,
			endLevel: addToQueueElement.endLevel,
			endTime: new Date(),
			isConsumed: false,
			costs: resourceCost,
		};

		queueElement.endTime = await this.prepareEndTimeForQueueElement(
			queueElement,
			building,
		);

		return queueElement;
	}

	protected async prepareStartTimeForQueueElement(
		buildingZone: BuildingZoneModel,
	): Promise<Date> {
		const currentBuildingQueue =
			await this.buildingQueueRepository.getCurrentBuildingQueueForHabitat(
				buildingZone.habitatId,
			);

		if (currentBuildingQueue.length === 0) {
			return new Date();
		}

		const lastBuildingQueueElement = currentBuildingQueue.at(-1)!;

		return lastBuildingQueueElement.endTime;
	}

	protected async prepareEndTimeForQueueElement(
		queueElement: BuildingQueueElementModel,
		building: BuildingModel,
	): Promise<Date> {
		const startTime = DateTime.fromJSDate(queueElement.startTime);
		const {data: upgradeTime, error} =
			await this.buildingService.calculateTimeInSecondsToUpgradeBuilding({
				startLevel: queueElement.startLevel,
				endLevel: queueElement.endLevel,
				buildingId: building.id,
			});

		if (error) {
			throw new InternalEmitterError(error.message);
		}
		return startTime.plus({second: upgradeTime ?? 0}).toJSDate();
	}
}
