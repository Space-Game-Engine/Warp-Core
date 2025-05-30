import {Inject, Injectable} from '@nestjs/common';

import {InternalExchangeEmitter} from '@warp-core/core/utils/internal-exchange';
import {HabitatCreatedEvent} from '@warp-core/user/habitat';
import {NewHabitatNames} from '@warp-core/user/habitat/exchange/emit/new-habitat.names';

@Injectable()
export class NewHabitatEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public newHabitatAfterRegistration(
		input: HabitatCreatedEvent,
	): Promise<void> {
		return this.emitter.emit({
			eventName: NewHabitatNames.HabitatCreatedAfterRegistration,
			requestData: input,
		});
	}

	public newHabitatCreatedBeforeSave(
		input: HabitatCreatedEvent,
	): Promise<void> {
		return this.emitter.emit({
			eventName: NewHabitatNames.HabitatCreatedBeforeSave,
			requestData: input,
		});
	}

	public newHabitatCreatedAfterSave(input: HabitatCreatedEvent): Promise<void> {
		return this.emitter.emit({
			eventName: NewHabitatNames.HabitatCreatedAfterSave,
			requestData: input,
		});
	}
}
