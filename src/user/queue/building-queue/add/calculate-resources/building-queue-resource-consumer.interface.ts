import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

export abstract class BuildingQueueResourceConsumerInterface {
	/**
	 * Method to calculate resources for queue
	 */
	public abstract calculateResourcesCosts(
		addToQueueElement: AddToQueueInput,
		buildingZone: BuildingZoneModel,
		building: BuildingModel,
	): Promise<QueueElementCostModel[]>;
}
