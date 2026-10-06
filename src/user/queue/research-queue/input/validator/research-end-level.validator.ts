import {Injectable} from '@nestjs/common';

import {QueueItemValidatorInterface} from '@warp-core/user/queue/core';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

@Injectable()
export class ResearchEndLevelValidator
	implements QueueItemValidatorInterface<ResearchQueueInputValidation>
{
	public async validate({
		addToQueueInput,
		researchNode,
		habitatResearchNode,
		validationError,
	}: ResearchQueueInputValidation): Promise<void> {
		const currentLevel = habitatResearchNode?.currentLevel ?? 0;

		if (addToQueueInput.endLevel < currentLevel) {
			validationError.addError(
				'endLevel',
				'End level should not be lower than existing level.',
			);
			return;
		}
		if (addToQueueInput.endLevel === currentLevel) {
			validationError.addError(
				'endLevel',
				'End level should not equal existing level.',
			);
			return;
		}

		const lastPossibleUpdate = (
			await researchNode.researchNodeDetailsAtCertainLevel
		).at(-1);

		if (!lastPossibleUpdate) {
			validationError.addError(
				'endLevel',
				`Last possible update value for research node ${researchNode.id} does not exists`,
			);
			return;
		}

		if (addToQueueInput.endLevel > lastPossibleUpdate.details.level) {
			validationError.addError(
				'endLevel',
				'You cannot update higher than it is possible. Check research node update details.',
			);
		}
	}
}
