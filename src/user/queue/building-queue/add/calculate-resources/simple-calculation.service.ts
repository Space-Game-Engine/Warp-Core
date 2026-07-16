import {Injectable} from '@nestjs/common';

import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';
import {BuildingQueueResourceConsumerInterface} from '@warp-core/user/queue/building-queue/add/calculate-resources/building-queue-resource-consumer.interface';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

@Injectable()
@AddMechanic(BuildingQueueResourceConsumerInterface, 'simple-resource-consumer')
export class SimpleCalculationService
	implements BuildingQueueResourceConsumerInterface
{
	public async calculateResourcesCosts(
		addToQueueElement: AddToQueueInput,
		buildingZone: BuildingZoneModel,
		building: BuildingModel,
	): Promise<QueueElementCostModel[]> {
		const queueCost = new Map<string, QueueElementCostModel>();

		const allBuildingDetails = await building.buildingDetailsAtCertainLevel;
		const buildingDetailsForUpdate = allBuildingDetails.filter(
			buildingDetails => {
				return (
					buildingDetails.details.level > buildingZone.level &&
					buildingDetails.details.level <= addToQueueElement.endLevel
				);
			},
		);

		for (const buildingDetailsForUpdateElement of buildingDetailsForUpdate) {
			const buildingUpdateCosts =
				(await buildingDetailsForUpdateElement.details.requirements) ?? [];

			for (const buildingUpdateCost of buildingUpdateCosts) {
				const resource = await buildingUpdateCost.resource;
				if (!resource || !buildingUpdateCost.cost) {
					continue;
				}
				this.addToQueueCost(queueCost, resource, buildingUpdateCost.cost);
			}
		}

		return Array.from(queueCost, ([, cost]) => cost);
	}

	private addToQueueCost(
		queueCost: Map<string, QueueElementCostModel>,
		resource: ResourceModel,
		cost: number,
	): void {
		let queueCostPerResource: QueueElementCostModel;

		if (queueCost.has(resource.id) === true) {
			queueCostPerResource = queueCost.get(
				resource.id,
			) as QueueElementCostModel;
		} else {
			queueCostPerResource = new QueueElementCostModel();
			queueCostPerResource.resource = resource;
			queueCostPerResource.cost = 0;
		}

		queueCostPerResource.cost += cost;

		queueCost.set(resource.id, queueCostPerResource);
	}
}
