import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/core';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

@Injectable()
export class ResearchConfigurationValidator
	implements QueueItemValidatorInterface<ResearchQueueInputValidation>
{
	constructor(
		private readonly researchQueueRepository: ResearchQueueRepository,
		private readonly runtimeConfig: RuntimeConfig,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async validate({
		addToQueueInput,
		habitatResearchNode,
		validationError,
	}: ResearchQueueInputValidation): Promise<void> {
		if (this.runtimeConfig.habitat.researchQueue.allowMultipleLevelUpdate) {
			const errorMessage = await this.isPossibleToQueueElementByMultipleLevels(
				addToQueueInput,
			);
			if (errorMessage) {
				validationError.addError('endLevel', errorMessage);
			}
		} else {
			const isPossibleToQueueElementByOneLevel =
				this.isPossibleToQueueElementByOneLevel(
					addToQueueInput,
					habitatResearchNode,
				);
			if (!isPossibleToQueueElementByOneLevel) {
				validationError.addError(
					'endLevel',
					'You can only upgrade a research node by one level at a time',
				);
			}
		}
	}

	private isPossibleToQueueElementByOneLevel(
		addToQueueElement: AddResearchToQueueInput,
		habitatResearchNode: HabitatResearchNodeModel | null,
	): boolean {
		const currentLevel = habitatResearchNode?.currentLevel ?? 0;

		return addToQueueElement.endLevel - 1 <= currentLevel;
	}

	private async isPossibleToQueueElementByMultipleLevels(
		addToQueueElement: AddResearchToQueueInput,
	): Promise<string | null> {
		const currentResearchQueue =
			await this.researchQueueRepository.getCurrentResearchQueueForResearchNode(
				addToQueueElement.researchNodeId,
				this.habitatModel.id,
			);
		const latestQueueElement = currentResearchQueue.at(-1);

		if (!latestQueueElement) {
			return null;
		}

		if (latestQueueElement.endLevel >= addToQueueElement.endLevel) {
			return 'New queue element should have end level higher than last queue element';
		}

		return null;
	}
}
