import {Injectable, Logger} from '@nestjs/common';
import {DateTime} from 'luxon';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {CalculationMechanic} from '@warp-core/user/resources/service/calculate/resource-calculation/calculation-mechanic.interface';
import {WarehouseStorageCalculationMechanic} from '@warp-core/user/resources/service/calculate/warehouse-storage/warehouse-storage-calculation-mechanic.interface';

@Injectable()
export class ResourceCalculatorService {
	private readonly logger = new Logger(ResourceCalculatorService.name);

	constructor(
		private readonly habitatResourceRepository: HabitatResourceRepository,
		private readonly calculateResourceStorage: WarehouseStorageCalculationMechanic,
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
				await habitatResource.habitat,
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
