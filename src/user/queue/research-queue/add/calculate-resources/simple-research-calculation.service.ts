import {Injectable} from '@nestjs/common';

import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {AbstractQueueCostCalculationService} from '@warp-core/user/queue/core';
import {ResearchQueueResourceConsumerInterface} from '@warp-core/user/queue/research-queue/add/calculate-resources/research-queue-resource-consumer.interface';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

@Injectable()
@AddMechanic(ResearchQueueResourceConsumerInterface, 'simple-resource-consumer')
export class SimpleResearchCalculationService
	extends AbstractQueueCostCalculationService
	implements ResearchQueueResourceConsumerInterface
{
	public async calculateResourcesCosts(
		addToQueueElement: AddResearchToQueueInput,
		habitatResearchNode: HabitatResearchNodeModel | null,
		researchNode: ResearchNodeModel,
	): Promise<QueueElementCostModel[]> {
		const allResearchNodeDetails =
			await researchNode.researchNodeDetailsAtCertainLevel;
		const levelDetails = allResearchNodeDetails.map(
			researchNodeDetails => researchNodeDetails.details,
		);

		return this.sumRequirementsForLevels(
			levelDetails,
			habitatResearchNode?.currentLevel ?? 0,
			addToQueueElement.endLevel,
		);
	}
}
