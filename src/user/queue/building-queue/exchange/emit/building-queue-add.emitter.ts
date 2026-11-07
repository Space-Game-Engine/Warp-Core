import {Inject, Injectable} from '@nestjs/common';

import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingQueueNames} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue.names';
import {AbstractQueueAddEmitter} from '@warp-core/user/queue/core';

@Injectable()
export class BuildingQueueAddEmitter extends AbstractQueueAddEmitter<BuildingQueueElementModel> {
	protected readonly beforeAddingEventName =
		BuildingQueueNames.BeforeAddingElement;
	protected readonly afterAddingEventName =
		BuildingQueueNames.AfterAddingElement;

	constructor(
		@Inject(InternalExchangeEmitter)
		emitter: InternalExchangeEmitter,
	) {
		super(emitter);
	}
}
