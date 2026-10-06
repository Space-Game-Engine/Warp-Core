import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

export abstract class ResearchQueueResourceConsumerInterface {
	/**
	 * Method to calculate resources for queue
	 */
	public abstract calculateResourcesCosts(
		addToQueueElement: AddResearchToQueueInput,
		habitatResearchNode: HabitatResearchNodeModel | null,
		researchNode: ResearchNodeModel,
	): Promise<QueueElementCostModel[]>;
}
