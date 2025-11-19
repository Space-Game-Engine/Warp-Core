import {BadRequestException, Injectable} from '@nestjs/common';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue';
import {InsufficientResourceType} from '@warp-core/user/resources/exception/insufficient-resource.type';
import {InsufficientResourcesException} from '@warp-core/user/resources/exception/Insufficient-resources.exception';

@Injectable()
export class ValidateQueueResourcesService {
	constructor(
		private readonly habitatResourceRepository: HabitatResourceRepository,
	) {}

	public async validate({
		queueElement,
	}: BuildingQueueProcessing): Promise<void> {
		const requiredResources =
			await this.habitatResourceRepository.getHabitatResourcesByQueueCostItems(
				queueElement.costs,
				(await queueElement.buildingZone).habitatId,
			);

		if (requiredResources.length !== queueElement.costs.length) {
			throw new BadRequestException(
				'Requested resources from queue does not equal resources from habitat',
			);
		}

		const errors = this.validateResources(
			queueElement.costs,
			requiredResources,
		);

		if (errors.length > 0) {
			throw new InsufficientResourcesException(errors);
		}
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
}
