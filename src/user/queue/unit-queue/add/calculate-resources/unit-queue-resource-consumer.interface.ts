import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

export abstract class UnitQueueResourceConsumerInterface {
	/**
	 * Method to calculate resources for queue
	 */
	public abstract calculateResourcesCosts(
		addToQueueElement: AddUnitToQueueInput,
		unit: UnitBlueprintGlobalModel,
	): Promise<QueueElementCostModel[]>;
}
