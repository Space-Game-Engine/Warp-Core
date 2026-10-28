import {Injectable} from '@nestjs/common';

import {CustomValidator} from '@warp-core/core';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {ResearchConfigurationValidator} from '@warp-core/user/queue/research-queue/input/validator/research-configuration.validator';
import {ResearchEndLevelValidator} from '@warp-core/user/queue/research-queue/input/validator/research-end-level.validator';
import {ResearchMaxQueueCountValidator} from '@warp-core/user/queue/research-queue/input/validator/research-max-queue-count.validator';
import {ResearchRequirementsValidator} from '@warp-core/user/queue/research-queue/input/validator/research-requirements.validator';
import {ValidateSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/input/validator/validate-single-research-queue-element.service';

@Injectable()
export class AddResearchToQueueValidator extends CustomValidator<AddResearchToQueueInput> {
	constructor(
		private readonly validateQueueItem: ValidateSingleResearchQueueElementService,
		private readonly configurationValidator: ResearchConfigurationValidator,
		private readonly endLevelValidator: ResearchEndLevelValidator,
		private readonly maxQueueCount: ResearchMaxQueueCountValidator,
		private readonly requirementsValidator: ResearchRequirementsValidator,
	) {
		super();
	}

	protected async customValidator(
		addToQueue: AddResearchToQueueInput,
	): Promise<boolean> {
		return this.validateQueueItem.validateQueueItem({
			addToQueueInput: addToQueue,
			validators: [
				this.configurationValidator,
				this.endLevelValidator,
				this.maxQueueCount,
				this.requirementsValidator,
			],
		});
	}
}
