import {BadRequestException, Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue';
import {InsufficientResourceType} from '@warp-core/user/resources/exception/insufficient-resource.type';
import {InsufficientResourcesException} from '@warp-core/user/resources/exception/Insufficient-resources.exception';

@Injectable()
export class QueueResourceExtractorService {
	constructor(
		private readonly habitatModel: AuthorizedHabitatModel,
		private readonly habitatResourceRepository: HabitatResourceRepository,
	) {}

	public async useResourcesOnQueueUpdate(
		queueProcessingEvent: BuildingQueueProcessing,
	): Promise<void> {
		const queueElement = queueProcessingEvent.queueElement;
		const requiredResources = await this.getRequiredResourcesFromHabitat(
			queueElement.costs,
		);
		const errors = this.validateResources(
			queueElement.costs,
			requiredResources,
		);

		if (errors.length > 0) {
			throw new InsufficientResourcesException(errors);
		}

		await this.extractResources(
			queueElement.costs,
			requiredResources,
			queueElement.endTime,
		);
	}

	private async getRequiredResourcesFromHabitat(
		queueCost: QueueElementCostModel[],
	): Promise<HabitatResourceModel[]> {
		const requiredResourcesIds = queueCost.map(cost => cost.resource.id);

		const resourcesFromHabitat =
			await this.habitatResourceRepository.getHabitatResourcesByIds(
				requiredResourcesIds,
				this.habitatModel.id,
			);

		if (resourcesFromHabitat.length !== requiredResourcesIds.length) {
			throw new BadRequestException(
				'Requested resources from queue does not equal resources from habitat',
			);
		}

		return resourcesFromHabitat;
	}

	private validateResources(
		queueCost: QueueElementCostModel[],
		requiredResources: HabitatResourceModel[],
	): InsufficientResourceType[] {
		const errors: InsufficientResourceType[] = [];

		for (const singleCost of queueCost) {
			const habitatResourceModel = requiredResources.find(
				singleResource => singleResource.resourceId === singleCost.resource.id,
			) as HabitatResourceModel;

			if (habitatResourceModel.currentAmount < singleCost.cost) {
				const difference = singleCost.cost - habitatResourceModel.currentAmount;
				errors.push({
					resourceId: singleCost.resource.id,
					resourceName: singleCost.resource.name,
					requiredResources: singleCost.cost,
					currentResources: habitatResourceModel.currentAmount,
					difference: difference,
				});
			}
		}
		return errors;
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
