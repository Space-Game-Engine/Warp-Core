import {
	BuildingModel,
	BuildingZoneModel,
	QueueElementCostModel,
} from '@warp-core/database';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

export interface ResourcesCalculatorInterface {
	/**
	 * Method to calculate resources for queue
	 * @param addToQueueElement
	 * @param buildingZone
	 * @param building
	 */
	calculateResourcesCosts(
		addToQueueElement: AddToQueueInput,
		buildingZone: BuildingZoneModel,
		building: BuildingModel,
	): Promise<QueueElementCostModel[]>;
}
