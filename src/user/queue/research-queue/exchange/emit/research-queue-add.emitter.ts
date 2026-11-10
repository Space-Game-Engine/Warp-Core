import {Inject, Injectable} from '@nestjs/common';

import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {AbstractQueueAddEmitter} from '@warp-core/user/queue/core';
import {ResearchQueueNames} from '@warp-core/user/queue/research-queue/exchange/emit/research-queue.names';

@Injectable()
export class ResearchQueueAddEmitter extends AbstractQueueAddEmitter<ResearchQueueElementModel> {
	protected readonly beforeAddingEventName =
		ResearchQueueNames.BeforeAddingElement;
	protected readonly afterAddingEventName =
		ResearchQueueNames.AfterAddingElement;

	constructor(
		@Inject(InternalExchangeEmitter)
		emitter: InternalExchangeEmitter,
	) {
		super(emitter);
	}
}
