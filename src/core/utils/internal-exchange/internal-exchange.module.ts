import {Global, Module} from '@nestjs/common';
import {DiscoveryModule} from '@nestjs/core';

import {EventEmitterService} from '@warp-core/core/utils/internal-exchange/event-emitter/event-emitter.service';
import {EventListenerService} from '@warp-core/core/utils/internal-exchange/event-emitter/event-listener.service';
import {InternalExchangeListenerLoader} from '@warp-core/core/utils/internal-exchange/internal-exchange-listener.loader';
import {InternalExchangeMetadataAccessor} from '@warp-core/core/utils/internal-exchange/internal-exchange-metadata.accessor';
import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange/internal-exchange.emitter';
import {InternalExchangeListener} from '@warp-core/core/utils/internal-exchange/internal-exchange.listener';

@Global()
@Module({
	providers: [
		InternalExchangeMetadataAccessor,
		InternalExchangeListenerLoader,
		{
			provide: InternalExchangeEmitter,
			useClass: EventEmitterService,
		},
		{
			provide: InternalExchangeListener,
			useClass: EventListenerService,
		},
	],
	imports: [DiscoveryModule],
	exports: [
		{
			provide: InternalExchangeEmitter,
			useClass: EventEmitterService,
		},
	],
})
export class InternalExchangeModule {}
