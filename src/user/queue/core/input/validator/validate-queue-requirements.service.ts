import {Injectable} from '@nestjs/common';

import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {ValidateBuildingRequirementsService} from '@warp-core/user/queue/core/input/validator/validate-building-requirements.service';
import {ValidateResearchNodeRequirementsService} from '@warp-core/user/queue/core/input/validator/validate-research-node-requirements.service';
import {
	getLevelDetailsForUpgrade,
	getRequirements,
} from '@warp-core/user/queue/core/util/level-details.util';

@Injectable()
export class ValidateQueueRequirementsService {
	constructor(
		private readonly validateResearchNodeRequirementsService: ValidateResearchNodeRequirementsService,
		private readonly validateBuildingRequirementsService: ValidateBuildingRequirementsService,
	) {}

	/**
	 * Adds error to validation error collector for every research node or building requirement
	 * of levels from start level (exclusive) to end level (inclusive) that is not met.
	 */
	public async validate(
		levelDetails: DetailsAtCertainLevelModel[],
		startLevel: number,
		endLevel: number,
		validationError: QueueValidationError,
	): Promise<void> {
		const requirements = await getRequirements(
			getLevelDetailsForUpgrade(levelDetails, startLevel, endLevel),
		);

		await this.validateResearchNodeRequirementsService.validate(
			requirements,
			validationError,
		);
		await this.validateBuildingRequirementsService.validate(
			requirements,
			validationError,
		);
	}
}
