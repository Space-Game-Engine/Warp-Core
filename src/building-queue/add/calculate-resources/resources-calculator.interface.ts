import {AddToQueueInput} from '@warp-core/building-queue/input/add-to-queue.input';
import {
	BuildingModel,
	BuildingZoneModel,
	QueueElementCostModel,
} from '@warp-core/database';

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
