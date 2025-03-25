import {Inject, Injectable} from '@nestjs/common';

import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {BuildingQueueNames} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue.names';
import {BuildingQueueProcessing} from '@warp-core/user/queue/building-queue/exchange/emit/types/building-queue-processing.type';

@Injectable()
export class BuildingQueueAddEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public beforeAddingElement(input: BuildingQueueProcessing): Promise<void> {
		return this.emitter.emit({
			eventName: BuildingQueueNames.BeforeAddingElement,
			requestData: input,
		});
	}

	public afterAddingElement(input: BuildingQueueProcessing): Promise<void> {
		return this.emitter.emit({
			eventName: BuildingQueueNames.AfterAddingElement,
			requestData: input,
		});
	}
}
