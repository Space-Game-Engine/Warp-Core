import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {AbstractQueueCostCalculationService} from '@warp-core/user/queue/core';
import {ResearchQueueResourceConsumerInterface} from '@warp-core/user/queue/research-queue/add/calculate-resources/research-queue-resource-consumer.interface';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

@Injectable()
@AddMechanic(ResearchQueueResourceConsumerInterface, 'simple-resource-consumer')
export class SimpleResearchCalculationService
	extends AbstractQueueCostCalculationService
	implements ResearchQueueResourceConsumerInterface
{
	constructor(
		private readonly researchQueueRepository: ResearchQueueRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {
		super();
	}

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
			await this.getAlreadyPaidLevel(
				researchNode.id,
				habitatResearchNode?.currentLevel ?? 0,
			),
			addToQueueElement.endLevel,
		);
	}

	/**
	 * Levels already on queue are paid when they were queued,
	 * so costs start from end level of last queue element.
	 */
	private async getAlreadyPaidLevel(
		researchNodeId: string,
		currentLevel: number,
	): Promise<number> {
		const currentResearchQueue =
			await this.researchQueueRepository.getCurrentResearchQueueForResearchNode(
				researchNodeId,
				this.habitatModel.id,
			);

		return currentResearchQueue.at(-1)?.endLevel ?? currentLevel;
	}
}
