import {Injectable, Logger} from '@nestjs/common';
import {DateTime} from 'luxon';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue';
import {CalculationMechanic} from '@warp-core/user/resources/service/calculate/mechanic/calculation-mechanic.interface';
import {CalculateResourceStorageService} from '@warp-core/user/resources/service/calculate/warehouse-storage/calculate-resource-storage.service';

@Injectable()
export class ResourceCalculatorService {
	private readonly logger = new Logger(ResourceCalculatorService.name);

	constructor(
		private readonly habitatResourceRepository: HabitatResourceRepository,
		private readonly calculateResourceStorage: CalculateResourceStorageService,
		private readonly calculationMechanic: CalculationMechanic,
	) {}

	public async calculateSingleResource(
		habitatResource: HabitatResourceModel,
		calculationEndTime: Date = new Date(),
	): Promise<void> {
		const {resourceId, habitatId} = habitatResource;

		this.logger.debug(
			`Calculate resource ${resourceId} for habitat ${habitatId}`,
		);

		const timeUntilNowInSeconds = this.calculateTimeToProcessResources(
			habitatResource,
			calculationEndTime,
		);

		const calculatedAmount =
			await this.calculationMechanic.calculateCurrentResourceValue(
				habitatResource,
				timeUntilNowInSeconds,
			);

		const currentMaxStorage =
			await this.calculateResourceStorage.calculateStorage(
				await habitatResource.resource,
			);

		const currentAmount =
			calculatedAmount > currentMaxStorage
				? currentMaxStorage
				: calculatedAmount;

		habitatResource.currentAmount = Math.round(currentAmount);

		this.logger.debug(
			`Resource ${resourceId} for habitat ${habitatId} is calculated`,
		);
	}

	public async addResourcesOnQueueUpdate({
		queueElement: buildingQueueElement,
	}: BuildingQueueProcessing): Promise<void> {
		const {habitatId} = await buildingQueueElement.buildingZone;

		this.logger.debug(
			`Calculating resource on queue update for building zone ${buildingQueueElement.buildingZoneId}`,
		);

		const habitatResources =
			await this.habitatResourceRepository.getHabitatResourceByBuildingAndLevel(
				await buildingQueueElement.building!,
				buildingQueueElement.startLevel,
				habitatId,
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

	private calculateTimeToProcessResources(
		habitatResource: HabitatResourceModel,
		calculationEndTime: Date = new Date(),
	): number {
		const lastCalculationTime = DateTime.fromJSDate(
			habitatResource.lastCalculationTime,
		);

		const calculatedDifference = lastCalculationTime
			.diff(DateTime.fromJSDate(calculationEndTime))
			.as('seconds');

		return Math.abs(calculatedDifference);
	}
}
