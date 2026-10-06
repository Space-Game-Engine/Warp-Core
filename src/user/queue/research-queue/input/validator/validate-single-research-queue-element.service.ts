import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {ResearchNodeQueryEmitter} from '@warp-core/global/research-node';
import {AbstractValidateQueueElementService} from '@warp-core/user/queue/core';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

@Injectable()
export class ValidateSingleResearchQueueElementService extends AbstractValidateQueueElementService<
	AddResearchToQueueInput,
	ResearchQueueInputValidation
> {
	constructor(
		protected readonly researchNodeService: ResearchNodeQueryEmitter,
		protected readonly habitatResearchNodeRepository: HabitatResearchNodeRepository,
		protected readonly habitatModel: AuthorizedHabitatModel,
	) {
		super();
	}

	protected async buildValidationContext(
		addToQueueInput: AddResearchToQueueInput,
		validationError: QueueValidationError,
	): Promise<ResearchQueueInputValidation> {
		const researchNode = await this.getResearchNode(
			addToQueueInput,
			validationError,
		);

		const habitatResearchNode =
			await this.habitatResearchNodeRepository.getForHabitatAndResearchNode(
				this.habitatModel.id,
				researchNode.id,
			);

		return {
			addToQueueInput,
			researchNode,
			habitatResearchNode,
			validationError,
		};
	}

	protected async getResearchNode(
		addToQueue: AddResearchToQueueInput,
		validationError: QueueValidationError,
	): Promise<ResearchNodeModel> {
		const {data: researchNode} =
			await this.researchNodeService.getResearchNodeById(
				addToQueue.researchNodeId,
			);

		if (!researchNode) {
			validationError.addError(
				'researchNodeId',
				'Provided research node does not exist.',
			);
			throw validationError;
		}

		return researchNode;
	}
}
