import {Injectable} from '@nestjs/common';

import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {BuildingQueueResourceConsumerInterface} from '@warp-core/user/queue/building-queue/add/calculate-resources/building-queue-resource-consumer.interface';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {AbstractQueueCostCalculationService} from '@warp-core/user/queue/core';

@Injectable()
@AddMechanic(BuildingQueueResourceConsumerInterface, 'simple-resource-consumer')
export class SimpleBuildingCalculationService
	extends AbstractQueueCostCalculationService
	implements BuildingQueueResourceConsumerInterface
{
	public async calculateResourcesCosts(
		addToQueueElement: AddToQueueInput,
		buildingZone: BuildingZoneModel,
		building: BuildingModel,
	): Promise<QueueElementCostModel[]> {
		const allBuildingDetails = await building.buildingDetailsAtCertainLevel;
		const levelDetails = allBuildingDetails.map(
			buildingDetails => buildingDetails.details,
		);

		return this.sumRequirementsForLevels(
			levelDetails,
			buildingZone.level,
			addToQueueElement.endLevel,
		);
	}
}
