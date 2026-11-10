import {Injectable} from '@nestjs/common';

import {QueueInputValidation} from '@warp-core/user/queue/building-queue/input/validator/type';
import {
	QueueItemValidatorInterface,
	ValidateQueueRequirementsService,
} from '@warp-core/user/queue/core';

@Injectable()
export class BuildingRequirementsValidator implements QueueItemValidatorInterface<QueueInputValidation> {
	constructor(
		private readonly validateQueueRequirementsService: ValidateQueueRequirementsService,
	) {}

	public async validate({
		building,
		buildingZone,
		addToQueueInput,
		validationError,
	}: QueueInputValidation): Promise<void> {
		const allBuildingDetails = await building.buildingDetailsAtCertainLevel;

		await this.validateQueueRequirementsService.validate(
			allBuildingDetails.map(buildingDetails => buildingDetails.details),
			buildingZone.level,
			addToQueueInput.endLevel,
			validationError,
		);
	}
}
