import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/core';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

@Injectable()
export class ResearchPrerequisitesValidator implements QueueItemValidatorInterface<ResearchQueueInputValidation> {
	constructor(
		private readonly habitatResearchNodeRepository: HabitatResearchNodeRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async validate({
		addToQueueInput,
		researchNode,
		habitatResearchNode,
		validationError,
	}: ResearchQueueInputValidation): Promise<void> {
		const requiredLevels = await this.getRequiredResearchNodeLevels(
			researchNode,
			habitatResearchNode?.currentLevel ?? 0,
			addToQueueInput.endLevel,
		);

		if (requiredLevels.size === 0) {
			return;
		}

		const developedResearchNodes =
			await this.habitatResearchNodeRepository.getForHabitatAndResearchNodes(
				this.habitatModel.id,
				Array.from(requiredLevels.keys()),
			);
		const developedLevels = new Map(
			developedResearchNodes.map(singleNode => [
				singleNode.researchNodeId,
				singleNode.currentLevel,
			]),
		);

		for (const [researchNodeId, requiredLevel] of requiredLevels) {
			if ((developedLevels.get(researchNodeId) ?? 0) < requiredLevel) {
				validationError.addError(
					'researchNodeId',
					`Research node ${researchNodeId} at level ${requiredLevel} is required.`,
				);
			}
		}
	}

	/**
	 * Returns the highest required level per research node, taken from
	 * requirements of every level between start (exclusive) and end level.
	 */
	private async getRequiredResearchNodeLevels(
		researchNode: ResearchNodeModel,
		startLevel: number,
		endLevel: number,
	): Promise<Map<string, number>> {
		const requiredLevels = new Map<string, number>();
		const allLevelDetails =
			await researchNode.researchNodeDetailsAtCertainLevel;

		for (const {details} of allLevelDetails) {
			if (details.level <= startLevel || details.level > endLevel) {
				continue;
			}

			for (const requirement of (await details.requirements) ?? []) {
				if (!requirement.researchNodeId || !requirement.researchNodeLevel) {
					continue;
				}

				requiredLevels.set(
					requirement.researchNodeId,
					Math.max(
						requiredLevels.get(requirement.researchNodeId) ?? 0,
						requirement.researchNodeLevel,
					),
				);
			}
		}

		return requiredLevels;
	}
}
