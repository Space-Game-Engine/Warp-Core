import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';

import {ResourceConsumerResolverInterface} from '@warp-core/core/utils';
import {DraftModelInterface} from '@warp-core/core/utils/model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {ResearchQueueAddService} from '@warp-core/user/queue/research-queue/add/research-queue-add.service';
import {ResearchQueueDraftService} from '@warp-core/user/queue/research-queue/add/research-queue-draft.service';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {AddResearchToQueueValidator} from '@warp-core/user/queue/research-queue/input/validator/add-research-to-queue.validator';
import {DraftResearchQueueElementValidator} from '@warp-core/user/queue/research-queue/input/validator/draft-research-queue-element.validator';
import {ResearchQueueHandlerService} from '@warp-core/user/queue/research-queue/research-queue-handler.service';

@Resolver(() => ResearchQueueElementModel)
export class ResearchQueueResolver implements ResourceConsumerResolverInterface {
	constructor(
		private readonly researchQueueAddService: ResearchQueueAddService,
		private readonly researchQueueDraftService: ResearchQueueDraftService,
		private readonly researchQueueHandlerService: ResearchQueueHandlerService,
	) {}

	@Mutation(() => ResearchQueueElementModel, {
		description: 'Add research node to queue and consume related resources',
		name: 'researchQueue_add',
	})
	public saveQueueElement(
		@Args('addToQueue', AddResearchToQueueValidator)
		addToQueue: AddResearchToQueueInput,
	): Promise<ResearchQueueElementModel> {
		return this.researchQueueAddService.saveQueueElement(addToQueue);
	}

	@Mutation(() => ResearchQueueElementModel, {
		description: 'Prepare a draft of a research queue element',
		name: 'researchQueue_getDraft',
	})
	public getDraft(
		@Args('addToQueue', DraftResearchQueueElementValidator)
		addToQueue: AddResearchToQueueInput,
	): Promise<DraftModelInterface> {
		return this.researchQueueDraftService.getDraft(addToQueue);
	}

	@Query(() => [ResearchQueueElementModel], {
		description:
			'Checks all items in research queue, recalculate them and return current items from queue',
		name: 'researchQueue_getAll',
	})
	public async getQueueItems(): Promise<ResearchQueueElementModel[]> {
		await this.researchQueueHandlerService.resolveQueue();

		return this.researchQueueHandlerService.getQueueItemsForHabitat();
	}

	@ResolveField()
	public async researchNode(
		@Parent() researchQueueElement: ResearchQueueElementModel,
	): Promise<ResearchNodeModel> {
		return researchQueueElement.researchNode;
	}

	@ResolveField()
	public async habitat(
		@Parent() researchQueueElement: ResearchQueueElementModel,
	): Promise<HabitatModel> {
		return researchQueueElement.habitat;
	}
}
