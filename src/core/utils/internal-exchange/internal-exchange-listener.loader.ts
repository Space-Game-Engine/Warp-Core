import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {DiscoveryService, MetadataScanner} from '@nestjs/core';
import {InstanceWrapper} from '@nestjs/core/injector/instance-wrapper';

import {InternalExchangeMetadataAccessor} from '@warp-core/core/utils/internal-exchange/internal-exchange-metadata.accessor';
import {InternalExchangeListener} from '@warp-core/core/utils/internal-exchange/internal-exchange.listener';

@Injectable()
export class InternalExchangeListenerLoader implements OnApplicationBootstrap {
	constructor(
		private readonly metadataScanner: MetadataScanner,
		private readonly discoveryService: DiscoveryService,
		private readonly internalEventMetadataAccessor: InternalExchangeMetadataAccessor,
		private readonly internalEventListener: InternalExchangeListener,
	) {}

	public onApplicationBootstrap(): void {
		this.loadEventListeners();
	}

	private loadEventListeners(): void {
		const providers = this.discoveryService.getProviders();
		const controllers = this.discoveryService.getControllers();
		[...providers, ...controllers]
			.filter(wrapper => wrapper.instance && !wrapper.isAlias)
			.forEach((wrapper: InstanceWrapper) => {
				const {instance} = wrapper;
				const prototype = Object.getPrototypeOf(instance) || {};
				this.metadataScanner
					.getAllMethodNames(prototype)
					.forEach(methodName => {
						this.subscribeToEventIfListener(instance, methodName);
					});
			});
	}

	private subscribeToEventIfListener(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		instance: Record<string, any>,
		methodKey: string,
	): void {
		const arrayOfEventListenerMetadata =
			this.internalEventMetadataAccessor.getEventHandlerMetadata(
				instance[methodKey],
			);

		if (!arrayOfEventListenerMetadata) {
			return;
		}

		for (const eventListenerMetadata of arrayOfEventListenerMetadata) {
			const {eventName} = eventListenerMetadata;

			this.internalEventListener.registerListener(
				eventName,
				instance,
				methodKey,
			);
		}
	}
}
