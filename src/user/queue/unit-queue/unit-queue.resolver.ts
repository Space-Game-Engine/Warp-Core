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
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {UnitQueueAddService} from '@warp-core/user/queue/unit-queue/add/unit-queue-add.service';
import {UnitQueueDraftService} from '@warp-core/user/queue/unit-queue/add/unit-queue-draft.service';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';
import {AddUnitToQueueValidator} from '@warp-core/user/queue/unit-queue/input/validator/add-unit-to-queue.validator';
import {DraftUnitQueueElementValidator} from '@warp-core/user/queue/unit-queue/input/validator/draft-unit-queue-element.validator';
import {UnitQueueHandlerService} from '@warp-core/user/queue/unit-queue/unit-queue-handler.service';

@Resolver(() => UnitQueueElementModel)
export class UnitQueueResolver implements ResourceConsumerResolverInterface {
	constructor(
		private readonly unitQueueAddService: UnitQueueAddService,
		private readonly unitQueueDraftService: UnitQueueDraftService,
		private readonly unitQueueHandlerService: UnitQueueHandlerService,
	) {}

	@Mutation(() => UnitQueueElementModel, {
		description: 'Add units to queue and consume related resources',
		name: 'unitQueue_add',
	})
	public saveQueueElement(
		@Args('addToQueue', AddUnitToQueueValidator)
		addToQueue: AddUnitToQueueInput,
	): Promise<UnitQueueElementModel> {
		return this.unitQueueAddService.saveQueueElement(addToQueue);
	}

	@Mutation(() => UnitQueueElementModel, {
		description: 'Prepare a draft of a unit queue element',
		name: 'unitQueue_getDraft',
	})
	public getDraft(
		@Args('addToQueue', DraftUnitQueueElementValidator)
		addToQueue: AddUnitToQueueInput,
	): Promise<DraftModelInterface> {
		return this.unitQueueDraftService.getDraft(addToQueue);
	}

	@Query(() => [UnitQueueElementModel], {
		description:
			'Checks all items in unit queue, recalculate them and return current items from queue',
		name: 'unitQueue_getAll',
	})
	public async getQueueItems(): Promise<UnitQueueElementModel[]> {
		await this.unitQueueHandlerService.resolveQueue();

		return this.unitQueueHandlerService.getQueueItemsForHabitat();
	}

	@ResolveField()
	public async unit(
		@Parent() unitQueueElement: UnitQueueElementModel,
	): Promise<UnitBlueprintGlobalModel> {
		return unitQueueElement.unit;
	}

	@ResolveField()
	public async habitat(
		@Parent() unitQueueElement: UnitQueueElementModel,
	): Promise<HabitatModel> {
		return unitQueueElement.habitat;
	}
}
