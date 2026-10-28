import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {getLevelDetailsForUpgrade} from '@warp-core/user/queue/core/util/level-details.util';

@Injectable()
export class ValidateQueueRequirementsService {
	constructor(
		private readonly habitatResearchNodeRepository: HabitatResearchNodeRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	/**
	 * Adds error to validation error collector for every research node requirement
	 * of levels from start level (exclusive) to end level (inclusive) that is not met.
	 */
	public async validate(
		levelDetails: DetailsAtCertainLevelModel[],
		startLevel: number,
		endLevel: number,
		validationError: QueueValidationError,
	): Promise<void> {
		const requiredLevels = await this.getRequiredResearchNodeLevels(
			getLevelDetailsForUpgrade(levelDetails, startLevel, endLevel),
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
					'requirements',
					`Research node ${researchNodeId} at level ${requiredLevel} is required.`,
				);
			}
		}
	}

	private async getRequiredResearchNodeLevels(
		levelDetails: DetailsAtCertainLevelModel[],
	): Promise<Map<string, number>> {
		const requiredLevels = new Map<string, number>();

		for (const singleLevelDetails of levelDetails) {
			for (const requirement of (await singleLevelDetails.requirements) ?? []) {
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
