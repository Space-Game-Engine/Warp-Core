import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {ResearchNodeQueryEmitter} from '@warp-core/global/research-node';
import {AbstractPrepareQueueElementService} from '@warp-core/user/queue/core';
import {QueueError} from '@warp-core/user/queue/core/exception/queue.error';
import {ResearchQueueResourceConsumerInterface} from '@warp-core/user/queue/research-queue/add/calculate-resources/research-queue-resource-consumer.interface';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

@Injectable()
export class PrepareSingleResearchQueueElementService extends AbstractPrepareQueueElementService<
	AddResearchToQueueInput,
	ResearchQueueElementModel
> {
	constructor(
		protected readonly calculationService: ResearchQueueResourceConsumerInterface,
		protected readonly researchQueueRepository: ResearchQueueRepository,
		protected readonly habitatResearchNodeRepository: HabitatResearchNodeRepository,
		protected readonly researchNodeService: ResearchNodeQueryEmitter,
		protected readonly habitatModel: AuthorizedHabitatModel,
	) {
		super(researchQueueRepository);
	}

	protected async createDraftQueueElement(
		addToQueueElement: AddResearchToQueueInput,
	): Promise<ResearchQueueElementModel> {
		const researchNode = await this.getResearchNodeById(
			addToQueueElement.researchNodeId,
		);

		const habitatResearchNode =
			await this.habitatResearchNodeRepository.getForHabitatAndResearchNode(
				this.habitatModel.id,
				researchNode.id,
			);

		const resourceCost = await this.calculationService.calculateResourcesCosts(
			addToQueueElement,
			habitatResearchNode,
			researchNode,
		);

		return this.researchQueueRepository.create({
			id: null,
			researchNode: researchNode,
			researchNodeId: researchNode.id,
			habitatId: this.habitatModel.id,
			startTime: new Date(),
			startLevel: habitatResearchNode?.currentLevel ?? 0,
			endLevel: addToQueueElement.endLevel,
			endTime: new Date(),
			isConsumed: false,
			costs: resourceCost,
		});
	}

	protected async calculateUpgradeTimeInSeconds(
		queueElement: ResearchQueueElementModel,
	): Promise<number> {
		const {data: upgradeTime, error} =
			await this.researchNodeService.calculateTimeInSecondsToUpgradeResearchNode(
				{
					startLevel: queueElement.startLevel,
					endLevel: queueElement.endLevel,
					researchNodeId: queueElement.researchNodeId,
				},
			);

		if (error) {
			throw new InternalEmitterError(error.message);
		}

		return upgradeTime ?? 0;
	}

	private async getResearchNodeById(
		researchNodeId: string,
	): Promise<ResearchNodeModel> {
		const {data, error} =
			await this.researchNodeService.getResearchNodeById(researchNodeId);

		if (error) {
			throw new InternalEmitterError(error.message);
		}

		if (!data) {
			throw new QueueError('Failed to get research node');
		}

		return data;
	}
}
