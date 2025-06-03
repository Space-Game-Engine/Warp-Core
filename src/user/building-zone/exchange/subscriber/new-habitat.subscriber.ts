import {Injectable} from '@nestjs/common';

import {InternalExchangeEmitListener} from '@warp-core/core/utils/internal-exchange';
import {FirstHabitatCreatedService} from '@warp-core/user/building-zone/service/first-habitat-created.service';
import {NewHabitatCreatedService} from '@warp-core/user/building-zone/service/new-habitat-created.service';
import {HabitatCreatedEvent, NewHabitatNames} from '@warp-core/user/habitat';

@Injectable()
export class NewHabitatSubscriber {
	constructor(
		private readonly firstHabitatCreatedService: FirstHabitatCreatedService,
		private readonly newHabitatCreated: NewHabitatCreatedService,
	) {}

	@InternalExchangeEmitListener(NewHabitatNames.HabitatCreatedAfterRegistration)
	public newHabitatRegistered(
		newHabitatModel: HabitatCreatedEvent,
	): Promise<void> {
		return this.firstHabitatCreatedService.addBuildingsOnFirstHabitatCreation(
			newHabitatModel,
		);
	}

	@InternalExchangeEmitListener(NewHabitatNames.HabitatCreatedAfterSave)
	public newHabitatCreatedAndSaved(
		newHabitatModel: HabitatCreatedEvent,
	): Promise<void> {
		return this.newHabitatCreated.createBuildingZoneOnNewHabitatCreation(
			newHabitatModel,
		);
	}
}
