import {Injectable, Logger} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {
	BuildingProductionRateModel,
	BuildingQueueElementModel,
	BuildingRepository,
	HabitatResourceRepository,
} from '@warp-core/database';
import {QueueElementProcessedEvent} from '@warp-core/user/queue/building-queue';

@Injectable()
export class HabitatHasNewResourceProducerSubscriber {
	private readonly logger = new Logger(
		HabitatHasNewResourceProducerSubscriber.name,
	);

	constructor(
		private readonly buildingRepository: BuildingRepository,
		private readonly habitatResourceRepository: HabitatResourceRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	@OnEvent('building_queue.resolving.before_processing_element')
	public async updateLastCalculationDateOnHabitatResource(
		queueProcessingEvent: QueueElementProcessedEvent,
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
