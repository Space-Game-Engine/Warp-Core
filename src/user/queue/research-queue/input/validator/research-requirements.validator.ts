import {Injectable} from '@nestjs/common';

import {
	QueueItemValidatorInterface,
	ValidateQueueRequirementsService,
} from '@warp-core/user/queue/core';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

@Injectable()
export class ResearchRequirementsValidator implements QueueItemValidatorInterface<ResearchQueueInputValidation> {
	constructor(
		private readonly validateQueueRequirementsService: ValidateQueueRequirementsService,
	) {}

	public async validate({
		researchNode,
		habitatResearchNode,
		addToQueueInput,
		validationError,
	}: ResearchQueueInputValidation): Promise<void> {
		const allResearchNodeDetails =
			await researchNode.researchNodeDetailsAtCertainLevel;

		await this.validateQueueRequirementsService.validate(
			allResearchNodeDetails.map(
				researchNodeDetails => researchNodeDetails.details,
			),
			habitatResearchNode?.currentLevel ?? 0,
			addToQueueInput.endLevel,
			validationError,
		);
	}
}
