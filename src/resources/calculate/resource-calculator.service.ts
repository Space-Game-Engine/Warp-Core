import {Injectable, Logger} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {AuthorizedHabitatModel} from '@warp-core/auth';
import {QueueElementProcessedEvent} from '@warp-core/building-queue';
import {
	BuildingZoneModel,
	BuildingZoneRepository,
	HabitatResourceModel,
	HabitatResourceRepository,
} from '@warp-core/database';
import {DateTime} from 'luxon';
import {CalculateResourceStorageService} from '@warp-core/resources/calculate/warehouse-storage/calculate-resource-storage.service';

@Injectable()
export class ResourceCalculatorService {
	private readonly logger = new Logger(ResourceCalculatorService.name);

	constructor(
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly habitatResourceRepository: HabitatResourceRepository,
		private readonly calculateResourceStorage: CalculateResourceStorageService,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	async calculateSingleResource(
		habitatResource: HabitatResourceModel,
		calculationEndTime: Date = new Date(),
	) {
		const resource = await habitatResource.resource;

		this.logger.debug(
			`Calculate resource ${resource.id} for habitat ${this.habitatModel.id}`,
		);

		const buildingZones =
			await this.buildingZoneRepository.getBuildingZoneProducersForSingleResource(
				this.habitatModel,
				resource,
			);

		for (const singleBuildingZone of buildingZones) {
			await this.calculateResourceForBuildingZone(
				habitatResource,
				singleBuildingZone,
				calculationEndTime,
			);
		}

		this.logger.debug(
			`Resource ${resource.id} for habitat ${this.habitatModel.id} is calculated`,
		);
	}

	@OnEvent('building_queue.resolving.before_processing_element')
	async addResourcesOnQueueUpdate(
		queueProcessingEvent: QueueElementProcessedEvent,
	) {
		const buildingQueueElement = queueProcessingEvent.queueElement;

		this.logger.debug(
			`Calculating resource on queue update for building zone ${buildingQueueElement.buildingZoneId}`,
		);
		const habitatResources =
			await this.habitatResourceRepository.getHabitatResourceByBuildingAndLevel(
				await buildingQueueElement.building!,
				buildingQueueElement.startLevel,
				this.habitatModel.id,
			);

		for (const singleHabitatResource of habitatResources) {
			await this.calculateSingleResource(
				singleHabitatResource,
				buildingQueueElement.endTime,
			);
			singleHabitatResource.lastCalculationTime = buildingQueueElement.endTime;
		}

		await this.habitatResourceRepository.save(habitatResources);
	}

	@OnEvent('building_queue.resolving.after_processing_element')
	async setLastCalculationTimeForNewResources(
		queueProcessingEvent: QueueElementProcessedEvent,
	) {
		const buildingQueueElement = queueProcessingEvent.queueElement;
		this.logger.debug(
			'Setting last calculation time for newly processed queue element',
		);
		const habitatResources =
			await this.habitatResourceRepository.getHabitatResourceByBuildingAndLevel(
				await buildingQueueElement.building!,
				buildingQueueElement.endLevel,
				this.habitatModel.id,
			);

		for (const singleHabitatResource of habitatResources) {
			if (singleHabitatResource.lastCalculationTime === null) {
				singleHabitatResource.lastCalculationTime =
					buildingQueueElement.endTime;
			}
		}

		await this.habitatResourceRepository.save(habitatResources);
	}

	private async calculateResourceForBuildingZone(
		habitatResource: HabitatResourceModel,
		buildingZone: BuildingZoneModel,
		calculationEndTime: Date,
	) {
		const productionRate = await this.getProductionRateForSingleBuildingZone(
			buildingZone,
		);
		const lastlyCalculatedAmount = habitatResource.currentAmount;
		const lastCalculationTime = DateTime.fromJSDate(
			habitatResource.lastCalculationTime ?? new Date(),
		);
		const timeUntilNowInSeconds = lastCalculationTime
			.diff(DateTime.fromJSDate(calculationEndTime))
			.as('seconds');

		const calculatedAmount =
			lastlyCalculatedAmount + productionRate * Math.abs(timeUntilNowInSeconds);
		const currentMaxStorage =
			await this.calculateResourceStorage.calculateStorage(
				await habitatResource.resource,
			);
		const currentAmount =
			calculatedAmount > currentMaxStorage
				? currentMaxStorage
				: calculatedAmount;

		habitatResource.currentAmount = Math.round(currentAmount);
	}

	private async getProductionRateForSingleBuildingZone(
		buildingZone: BuildingZoneModel,
	): Promise<number> {
		const building = await buildingZone.building!;
		const buildingDetailsAtCertainLevel =
			await building.buildingDetailsAtCertainLevel;
		const productionRateModel = await buildingDetailsAtCertainLevel[0]
			.productionRate;

		if (!productionRateModel) {
			return 0;
		}

		const productionRateValue = productionRateModel[0].productionRate;

		return productionRateValue;
	}
}
