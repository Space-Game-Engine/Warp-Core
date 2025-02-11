import {EventName} from '@warp-core/core/utils/internal-exchange/type';

export abstract class InternalExchangeListener {
	public abstract registerListener(
		eventName: EventName,
		instance: Record<string, (...args: unknown[]) => unknown>,
		methodName: string,
	): void;
}
