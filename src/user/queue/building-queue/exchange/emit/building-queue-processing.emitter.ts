import {Inject, Injectable} from '@nestjs/common';

import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingQueueNames} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue.names';
import {AbstractQueueProcessingEmitter} from '@warp-core/user/queue/core';

@Injectable()
export class BuildingQueueProcessingEmitter extends AbstractQueueProcessingEmitter<BuildingQueueElementModel> {
	protected readonly beforeProcessingEventName =
		BuildingQueueNames.BeforeProcessingElement;
	protected readonly afterProcessingEventName =
		BuildingQueueNames.AfterProcessingElement;

	constructor(
		@Inject(InternalExchangeEmitter)
		emitter: InternalExchangeEmitter,
	) {
		super(emitter);
	}
}
