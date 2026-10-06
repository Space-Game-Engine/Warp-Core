import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';

/**
 * Shared logic of summarizing resource requirements
 * defined in level details of a queued entity.
 */
export abstract class AbstractQueueCostCalculationService {
	protected async sumRequirementsForLevels(
		levelDetails: DetailsAtCertainLevelModel[],
		startLevel: number,
		endLevel: number,
	): Promise<QueueElementCostModel[]> {
		const queueCost = new Map<string, QueueElementCostModel>();

		const levelDetailsForUpdate = levelDetails.filter(singleLevelDetails => {
			return (
				singleLevelDetails.level > startLevel &&
				singleLevelDetails.level <= endLevel
			);
		});

		for (const singleLevelDetails of levelDetailsForUpdate) {
			const updateCosts = (await singleLevelDetails.requirements) ?? [];

			for (const updateCost of updateCosts) {
				const resource = await updateCost.resource;
				if (!resource || !updateCost.cost) {
					continue;
				}
				this.addToQueueCost(queueCost, resource, updateCost.cost);
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
