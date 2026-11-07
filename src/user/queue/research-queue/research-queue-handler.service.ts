import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {AbstractQueueHandlerService} from '@warp-core/user/queue/core';
import {ResearchQueueProcessingEmitter} from '@warp-core/user/queue/research-queue/exchange/emit/research-queue-processing.emitter';

@Injectable()
export class ResearchQueueHandlerService extends AbstractQueueHandlerService<ResearchQueueElementModel> {
	constructor(
		researchQueueRepository: ResearchQueueRepository,
		habitatModel: AuthorizedHabitatModel,
		researchQueueEmitter: ResearchQueueProcessingEmitter,
		private readonly habitatResearchNodeRepository: HabitatResearchNodeRepository,
	) {
		super(researchQueueRepository, habitatModel, researchQueueEmitter);
	}

	protected async applyQueueElement(
		queueElement: ResearchQueueElementModel,
	): Promise<void> {
		this.logger.debug(
			`Processing queue element for research node with id ${queueElement.researchNodeId}`,
		);

		const habitatResearchNode =
			await this.habitatResearchNodeRepository.getForHabitatAndResearchNode(
				queueElement.habitatId,
				queueElement.researchNodeId,
			);

		if (habitatResearchNode) {
			await this.habitatResearchNodeRepository.update(habitatResearchNode.id, {
				currentLevel: queueElement.endLevel,
				lastCalculationTime: queueElement.endTime,
			});

			return;
		}

		const newHabitatResearchNode = this.habitatResearchNodeRepository.create({
			habitatId: queueElement.habitatId,
			researchNodeId: queueElement.researchNodeId,
			currentLevel: queueElement.endLevel,
			lastCalculationTime: queueElement.endTime,
		});

		await this.habitatResearchNodeRepository.save(newHabitatResearchNode);
	}
}
