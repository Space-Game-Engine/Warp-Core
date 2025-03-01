import {extendArrayMetadata} from '@nestjs/common/utils/extend-metadata.util';

import {
	EventName,
	INTERNAL_EXCHANGE_METADATA,
	InternalExchangeMetadata,
} from '@warp-core/core/utils/internal-exchange/type';

export function InternalExchangeEmitListener(
	eventName: EventName,
): MethodDecorator {
	return (
		target: object,
		propertyKey: string,
		descriptor?: PropertyDescriptor,
	) => {
		extendArrayMetadata(
			INTERNAL_EXCHANGE_METADATA,
			[{eventName} as InternalExchangeMetadata],
			descriptor!.value,
		);
		return descriptor;
	};
}
