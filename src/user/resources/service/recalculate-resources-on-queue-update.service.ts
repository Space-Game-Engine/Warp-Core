import {Injectable, Logger} from '@nestjs/common';

import {BuildingProductionRateModel} from '@warp-core/database/model/building-production-rate.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingRepository} from '@warp-core/database/repository/building.repository';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue';
import {ResourceCalculatorService} from '@warp-core/user/resources/service/calculate/resource-calculator.service';

@Injectable()
export class RecalculateResourcesOnQueueUpdate {
	private readonly logger = new Logger(RecalculateResourcesOnQueueUpdate.name);

	constructor(
		private readonly buildingRepository: BuildingRepository,
		private readonly habitatResourceRepository: HabitatResourceRepository,
		private readonly resourceCalculatorService: ResourceCalculatorService,
	) {}

	public async updateLastCalculationDateOnHabitatResource(
		queueProcessingEvent: BuildingQueueProcessing,
	): Promise<void> {
		const queueElement = queueProcessingEvent.queueElement;

		this.logger.debug('Checking building production resources');

		const buildingProduction =
			await this.getProducedResourcesListForQueueElement(queueElement);

		if (buildingProduction.length === 0) {
			this.logger.debug('Queued building does not produce anything');
			return;
		}

		this.logger.debug('Updating last calculation date if needed');

		const resources =
			await this.habitatResourceRepository.getHabitatResourcesByIds(
				buildingProduction.map(
					singleBuildingProduction => singleBuildingProduction.resourceId,
				),
				(await queueElement.buildingZone).habitatId,
			);

		for (const resource of resources) {
			await this.resourceCalculatorService.calculateSingleResource(
				resource,
				queueElement.endTime,
			);
			resource.lastCalculationTime = queueElement.endTime;
		}

		await this.habitatResourceRepository.save(resources);

		this.logger.debug('Last calculation time from habitat resources updated');
	}

	private getProducedResourcesListForQueueElement(
		queueElement: BuildingQueueElementModel,
	): Promise<BuildingProductionRateModel[]> {
		return this.buildingRepository.getProductionRateForProvidedLevel(
			queueElement.buildingId!,
			queueElement.endLevel,
		);
	}
}
