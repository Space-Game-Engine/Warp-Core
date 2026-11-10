import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {getRequiredLevels} from '@warp-core/user/queue/core/util/level-details.util';

@Injectable()
export class ValidateResearchNodeRequirementsService {
	constructor(
		private readonly habitatResearchNodeRepository: HabitatResearchNodeRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	/**
	 * Adds error to validation error collector for every research node requirement
	 * that is not developed to required level.
	 */
	public async validate(
		requirements: RequirementsPerLevelModel[],
		validationError: QueueValidationError,
	): Promise<void> {
		const requiredLevels = getRequiredLevels(requirements, requirement => [
			requirement.researchNodeId,
			requirement.researchNodeLevel,
		]);

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
}
