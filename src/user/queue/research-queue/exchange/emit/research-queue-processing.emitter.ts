import {Inject, Injectable} from '@nestjs/common';

import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {AbstractQueueProcessingEmitter} from '@warp-core/user/queue/core';
import {ResearchQueueNames} from '@warp-core/user/queue/research-queue/exchange/emit/research-queue.names';

@Injectable()
export class ResearchQueueProcessingEmitter extends AbstractQueueProcessingEmitter<ResearchQueueElementModel> {
	protected readonly beforeProcessingEventName =
		ResearchQueueNames.BeforeProcessingElement;
	protected readonly afterProcessingEventName =
		ResearchQueueNames.AfterProcessingElement;

	constructor(
		@Inject(InternalExchangeEmitter)
		emitter: InternalExchangeEmitter,
	) {
		super(emitter);
	}
}
