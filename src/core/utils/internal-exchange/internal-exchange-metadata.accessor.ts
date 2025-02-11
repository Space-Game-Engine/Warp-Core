import {Injectable, Type} from '@nestjs/common';
import {Reflector} from '@nestjs/core';

import {
	INTERNAL_EXCHANGE_METADATA,
	InternalExchangeMetadata,
} from '@warp-core/core/utils/internal-exchange/type';

@Injectable()
export class InternalExchangeMetadataAccessor {
	constructor(private readonly reflector: Reflector) {}

	public getEventHandlerMetadata(
		target: Type<unknown>,
	): InternalExchangeMetadata[] | undefined {
		// Circumvent a crash that comes from reflect-metadata if it is
		// given a non-object non-function target to reflect upon.
		if (
			!target ||
			(typeof target !== 'function' && typeof target !== 'object')
		) {
			return undefined;
		}

		const metadata = this.reflector.get(INTERNAL_EXCHANGE_METADATA, target);
		if (!metadata) {
			return undefined;
		}

		return Array.isArray(metadata) ? metadata : [metadata];
	}
}
