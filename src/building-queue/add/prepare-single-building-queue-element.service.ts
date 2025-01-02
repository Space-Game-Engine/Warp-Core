import {Inject, Injectable} from '@nestjs/common';
import {DateTime} from 'luxon';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingService} from '@warp-core/building';
import {ResourcesCalculatorInterface} from '@warp-core/building-queue/add/calculate-resources/resources-calculator.interface';
import {AddToQueueInput} from '@warp-core/building-queue/input/add-to-queue.input';
import {
	BuildingModel,
	BuildingQueueElementModel,
	BuildingQueueRepository,
	BuildingZoneModel,
	BuildingZoneRepository,
} from '@warp-core/database';

@Injectable()
export class PrepareSingleBuildingQueueElementService {
	constructor(
		@Inject('QUEUE_ADD_CALCULATION')
		protected readonly calculationService: ResourcesCalculatorInterface,
		protected readonly buildingQueueRepository: BuildingQueueRepository,
		protected readonly buildingZoneRepository: BuildingZoneRepository,
		protected readonly buildingService: BuildingService,
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
			building = (await this.buildingService.getBuildingById(
				addToQueueElement.buildingId!,
			)) as BuildingModel;
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
		const upgradeTime =
			await this.buildingService.calculateTimeInSecondsToUpgradeBuilding(
				queueElement.startLevel,
				queueElement.endLevel,
				building.id,
			);
		const endTime = startTime.plus({second: upgradeTime}).toJSDate();

		return endTime;
	}
}
