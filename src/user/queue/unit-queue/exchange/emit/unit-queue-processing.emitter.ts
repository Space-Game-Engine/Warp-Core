import {Inject, Injectable} from '@nestjs/common';

import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {AbstractQueueProcessingEmitter} from '@warp-core/user/queue/core';
import {UnitQueueNames} from '@warp-core/user/queue/unit-queue/exchange/emit/unit-queue.names';

@Injectable()
export class UnitQueueProcessingEmitter extends AbstractQueueProcessingEmitter<UnitQueueElementModel> {
	protected readonly beforeProcessingEventName =
		UnitQueueNames.BeforeProcessingElement;
	protected readonly afterProcessingEventName =
		UnitQueueNames.AfterProcessingElement;

	constructor(
		@Inject(InternalExchangeEmitter)
		emitter: InternalExchangeEmitter,
	) {
		super(emitter);
	}
}
