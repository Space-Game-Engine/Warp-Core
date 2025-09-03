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
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingQueueAddService} from '@warp-core/user/queue/building-queue/add/building-queue-add.service';
import {BuildingQueueDraftService} from '@warp-core/user/queue/building-queue/add/building-queue-draft.service';
import {BuildingQueueHandlerService} from '@warp-core/user/queue/building-queue/building-queue-handler.service';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {AddToQueueValidator} from '@warp-core/user/queue/building-queue/input/validator/add-to-queue.validator';
import {DraftQueueElementValidator} from '@warp-core/user/queue/building-queue/input/validator/draft-queue-element.validator';

@Resolver(() => BuildingQueueElementModel)
export class BuildingQueueResolver
	implements ResourceConsumerResolverInterface
{
	constructor(
		private readonly buildingQueueAddService: BuildingQueueAddService,
		private readonly buildingQueueDraftService: BuildingQueueDraftService,
		private readonly buildingQueueHandlerService: BuildingQueueHandlerService,
	) {}

	@Mutation(() => BuildingQueueElementModel, {
		description: 'Add to element queue and consume related resources',
		name: 'buildingQueue_add',
	})
	public saveQueueElement(
		@Args('addToQueue', AddToQueueValidator) addToQueue: AddToQueueInput,
	): Promise<BuildingQueueElementModel> {
		return this.buildingQueueAddService.saveQueueElement(addToQueue);
	}

	@Mutation(() => BuildingQueueElementModel, {
		description: 'Prepare a draft of a queue element',
		name: 'buildingQueue_getDraft',
	})
	public getDraft(
		@Args('addToQueue', DraftQueueElementValidator) addToQueue: AddToQueueInput,
	): Promise<DraftModelInterface> {
		return this.buildingQueueDraftService.getDraft(addToQueue);
	}

	@Query(() => [BuildingQueueElementModel], {
		description:
			'Checks all items in queue, recalculate them and return current items from queue',
		name: 'buildingQueue_getAll',
	})
	public async getQueueItems(): Promise<BuildingQueueElementModel[]> {
		await this.buildingQueueHandlerService.resolveQueue();

		return this.buildingQueueHandlerService.getQueueItemsForHabitat();
	}

	@ResolveField()
	public async building(
		@Parent() buildingQueueElement: BuildingQueueElementModel,
	): Promise<BuildingModel | null | undefined> {
		return buildingQueueElement.building;
	}

	@ResolveField()
	public async buildingZone(
		@Parent() buildingQueueElement: BuildingQueueElementModel,
	): Promise<BuildingZoneModel> {
		return buildingQueueElement.buildingZone;
	}
}
