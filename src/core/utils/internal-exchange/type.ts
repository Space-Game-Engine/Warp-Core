export type EventName = symbol | string;

export type QueryExchangeSuccessResponse<Data> = {
	data: Data | undefined;
	error: undefined;
};

export type QueryExchangeErrorResponse = {
	data: undefined;
	error: {message: string; trace: string | undefined};
};
export type QueryExchangeResponse<Data> =
	| QueryExchangeSuccessResponse<Data>
	| QueryExchangeErrorResponse;

export abstract class QueryExchangeRequest {
	public eventName: EventName;
	public requestData: unknown;
}

export const INTERNAL_EXCHANGE_METADATA = 'internal-exchange-metadata';

export interface InternalExchangeMetadata {
	eventName: EventName;
}
