import {Inject, Injectable} from '@nestjs/common';

import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {AbstractQueueAddEmitter} from '@warp-core/user/queue/core';
import {UnitQueueNames} from '@warp-core/user/queue/unit-queue/exchange/emit/unit-queue.names';

@Injectable()
export class UnitQueueAddEmitter extends AbstractQueueAddEmitter<UnitQueueElementModel> {
	protected readonly beforeAddingEventName = UnitQueueNames.BeforeAddingElement;
	protected readonly afterAddingEventName = UnitQueueNames.AfterAddingElement;

	constructor(
		@Inject(InternalExchangeEmitter)
		emitter: InternalExchangeEmitter,
	) {
		super(emitter);
	}
}
