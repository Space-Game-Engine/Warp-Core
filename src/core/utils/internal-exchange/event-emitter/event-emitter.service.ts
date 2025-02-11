import {Injectable} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';

import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange/internal-exchange.emitter';
import {
	QueryExchangeRequest,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange/type';

export type EventEmitterRequest<Response> = {
	data: QueryExchangeRequest['requestData'];
	response: QueryExchangeResponse<Response>['data'];
};

@Injectable()
export class EventEmitterService extends InternalExchangeEmitter {
	constructor(private readonly eventEmitter: EventEmitter2) {
		super();
	}

	public async query<ResponseType>(
		request: QueryExchangeRequest,
	): Promise<QueryExchangeResponse<ResponseType>> {
		const emitObject: EventEmitterRequest<ResponseType> = {
			data: request.requestData,
			response: undefined,
		};

		try {
			await this.eventEmitter.emitAsync(request.eventName, emitObject);
		} catch (e) {
			if (e instanceof Error) {
				return {
					error: {
						message: e.message,
						trace: e.stack,
					},
					data: undefined,
				};
			}
		}

		return {
			data: emitObject.response,
			error: undefined,
		};
	}
}
