import {Injectable, Logger} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingProductionRateModel} from '@warp-core/database/model/building-production-rate.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingRepository} from '@warp-core/database/repository/building.repository';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue';

@Injectable()
export class HabitatHasNewResourceProducerService {
	private readonly logger = new Logger(
		HabitatHasNewResourceProducerService.name,
	);

	constructor(
		private readonly buildingRepository: BuildingRepository,
		private readonly habitatResourceRepository: HabitatResourceRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
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

		await this.habitatResourceRepository.updateLastCalculationDateForManyResources(
			buildingProduction.map(
				singleBuildingProduction => singleBuildingProduction.resourceId,
			),
			this.habitatModel.id,
			queueElement.endTime,
		);

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
