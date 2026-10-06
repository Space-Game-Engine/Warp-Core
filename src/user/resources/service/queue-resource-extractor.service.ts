import {Injectable} from '@nestjs/common';

import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResourceModel} from '@warp-core/database/model/resource/habitat-resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {QueueProcessing} from '@warp-core/user/queue/core';

@Injectable()
export class QueueResourceExtractorService {
	constructor(
		private readonly habitatResourceRepository: HabitatResourceRepository,
	) {}

	public async useResourcesOnQueueUpdate(
		queueProcessingEvent: QueueProcessing,
	): Promise<void> {
		const queueElement = queueProcessingEvent.queueElement;
		const requiredResources =
			await this.habitatResourceRepository.getHabitatResourcesByQueueCostItems(
				queueElement.costs,
				await queueElement.getHabitatId(),
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
