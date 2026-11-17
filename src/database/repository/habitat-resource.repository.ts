import {Injectable} from '@nestjs/common';
import {DataSource, In} from 'typeorm';

import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResourceModel} from '@warp-core/database/model/resource/habitat-resource.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class HabitatResourceRepository extends AbstractRepository<HabitatResourceModel> {
	constructor(private dataSource: DataSource) {
		super(HabitatResourceModel, dataSource.createEntityManager());
	}

	public getHabitatResourcesByQueueCostItems(
		queueCost: QueueElementCostModel[],
		habitatId: number,
	): Promise<HabitatResourceModel[]> {
		const requiredResourcesIds = queueCost.map(cost => cost.resource.id);

		return this.getHabitatResourcesByIds(requiredResourcesIds, habitatId);
	}

	public getHabitatResourcesByIds(
		resourcesIds: string[],
		habitatId: number,
	): Promise<HabitatResourceModel[]> {
		return this.findBy({
			resourceId: In(resourcesIds),
			habitatId: habitatId,
		});
	}
}
