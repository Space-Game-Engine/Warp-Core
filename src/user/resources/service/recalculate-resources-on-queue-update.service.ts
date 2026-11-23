import {Injectable, Logger} from '@nestjs/common';

import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue';
import {ResourceCalculatorService} from '@warp-core/user/resources/service/calculate/resource-calculator.service';

@Injectable()
export class RecalculateResourcesOnQueueUpdate {
	private readonly logger = new Logger(RecalculateResourcesOnQueueUpdate.name);

	constructor(
		private readonly buildingZoneEmitter: BuildingZoneEmitter,
		private readonly habitatResourceRepository: HabitatResourceRepository,
		private readonly resourceCalculatorService: ResourceCalculatorService,
	) {}

	public async updateLastCalculationDateOnHabitatResource(
		queueProcessingEvent: BuildingQueueProcessing,
	): Promise<void> {
		const queueElement = queueProcessingEvent.queueElement;

		this.logger.debug('Checking building production resources');

		const habitatId = await queueElement.getHabitatId();
		const producedResourcesIds = await this.getProducedResourcesIds(
			queueElement,
			habitatId,
		);

		if (producedResourcesIds.length === 0) {
			this.logger.debug('Queued building does not produce anything');
			return;
		}

		this.logger.debug('Updating last calculation date if needed');

		const resources =
			await this.habitatResourceRepository.getHabitatResourcesByIds(
				producedResourcesIds,
				habitatId,
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

	private async getProducedResourcesIds(
		queueElement: BuildingQueueElementModel,
		habitatId: number,
	): Promise<string[]> {
		const {data: capabilities, error} =
			await this.buildingZoneEmitter.getCalculatedCapabilities({
				habitatId: habitatId,
				buildingId: queueElement.buildingId!,
				level: queueElement.endLevel,
			});

		if (error) {
			throw new InternalEmitterError(error.message);
		}

		return (capabilities?.production ?? []).map(
			production => production.resourceId,
		);
	}
}
