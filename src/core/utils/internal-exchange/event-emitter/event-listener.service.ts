import {Injectable} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';

import {EventName} from '@warp-core/core/utils/internal-exchange';
import {EventEmitterRequest} from '@warp-core/core/utils/internal-exchange/event-emitter/event-emitter.service';
import {InternalExchangeListener} from '@warp-core/core/utils/internal-exchange/internal-exchange.listener';

@Injectable()
export class EventListenerService extends InternalExchangeListener {
	constructor(private readonly eventEmitter: EventEmitter2) {
		super();
	}
	public registerListener(
		eventName: EventName,
		instance: Record<string, (...args: unknown[]) => unknown>,
		methodName: string,
	): void {
		this.eventEmitter.on(
			eventName,
			async (request: EventEmitterRequest<unknown>) => {
				[request.response] = await Promise.all([
					instance[methodName].call(instance, request.data),
				]);
			},
		);
	}
}
