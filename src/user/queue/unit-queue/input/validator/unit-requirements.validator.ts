import {Injectable} from '@nestjs/common';

import {
	QueueItemValidatorInterface,
	ValidateBuildingRequirementsService,
	ValidateResearchNodeRequirementsService,
} from '@warp-core/user/queue/core';
import {UnitQueueInputValidation} from '@warp-core/user/queue/unit-queue/input/validator/type';

@Injectable()
export class UnitRequirementsValidator implements QueueItemValidatorInterface<UnitQueueInputValidation> {
	constructor(
		private readonly validateResearchNodeRequirementsService: ValidateResearchNodeRequirementsService,
		private readonly validateBuildingRequirementsService: ValidateBuildingRequirementsService,
	) {}

	public async validate({
		unit,
		validationError,
	}: UnitQueueInputValidation): Promise<void> {
		const requirements = (await unit.requirements) ?? [];

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
