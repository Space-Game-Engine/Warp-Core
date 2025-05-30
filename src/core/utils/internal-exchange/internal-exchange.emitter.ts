import {
	QueryExchangeRequest,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange/type';

export abstract class InternalExchangeEmitter {
	/**
	 * Allows sending queries to other parts of the system
	 * without being dependent on other modules.
	 *
	 * It sends a query into another module and reply with response.
	 * @param request
	 */
	public abstract query<ResponseType>(
		request: QueryExchangeRequest,
	): Promise<QueryExchangeResponse<ResponseType>>;

	/**
	 * Emits request without any response. It can be used as an emit-forget (without resolving promise)
	 * or wait until promise will end.
	 * @param request
	 */
	public abstract emit(request: QueryExchangeRequest): Promise<void>;
}
