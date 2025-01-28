import {
	QueryExchangeRequest,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange/type';

export abstract class InternalExchangeEmitter {
	public abstract query<ResponseType>(
		request: QueryExchangeRequest,
	): Promise<QueryExchangeResponse<ResponseType>>;
}
