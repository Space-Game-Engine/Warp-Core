import {Injectable} from '@nestjs/common';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue';

@Injectable()
export class QueueResourceExtractorService {
	constructor(
		private readonly habitatResourceRepository: HabitatResourceRepository,
	) {}

	public async useResourcesOnQueueUpdate(
		queueProcessingEvent: BuildingQueueProcessing,
	): Promise<void> {
		const queueElement = queueProcessingEvent.queueElement;
		const requiredResources =
			await this.habitatResourceRepository.getHabitatResourcesByQueueCostItems(
				queueElement.costs,
				(await queueElement.buildingZone).habitatId,
			);
		const now = new Date();

		await this.extractResources(queueElement.costs, requiredResources, now);
	}

	private async extractResources(
		queueCost: QueueElementCostModel[],
		requiredResources: HabitatResourceModel[],
		lastCalculationTime: Date,
	): Promise<void> {
		for (const singleRequiredResource of requiredResources) {
			const queueCostPerResource = queueCost.find(
				cost => cost.resource.id === singleRequiredResource.resourceId,
			) as QueueElementCostModel;

			singleRequiredResource.currentAmount -= queueCostPerResource.cost;

			await this.habitatResourceRepository.update(singleRequiredResource.id, {
				currentAmount: singleRequiredResource.currentAmount,
				lastCalculationTime,
			});
		}
	}
}
