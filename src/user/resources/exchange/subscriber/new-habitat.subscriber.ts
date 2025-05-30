import {Injectable} from '@nestjs/common';

import {InternalExchangeEmitListener} from '@warp-core/core/utils/internal-exchange';
import {HabitatCreatedEvent, NewHabitatNames} from '@warp-core/user/habitat';
import {AddResourcesOnFirstHabitatService} from '@warp-core/user/resources/service/add-resources-on-first-habitat.service';
import {CreateResourcesPerHabitatService} from '@warp-core/user/resources/service/create-resources-per-habitat.service';

@Injectable()
export class NewHabitatSubscriber {
	public constructor(
		private readonly resourcesOnFirstHabitatService: AddResourcesOnFirstHabitatService,
		private readonly createResourcesPerHabitat: CreateResourcesPerHabitatService,
	) {}

	@InternalExchangeEmitListener(NewHabitatNames.HabitatCreatedAfterRegistration)
	public habitatCreatedAfterRegistration(
		newHabitatEvent: HabitatCreatedEvent,
	): Promise<void> {
		return this.resourcesOnFirstHabitatService.addResourcesToHabitat(
			newHabitatEvent,
		);
	}

	@InternalExchangeEmitListener(NewHabitatNames.HabitatCreatedAfterSave)
	public newHabitatCreated(
		newHabitatEvent: HabitatCreatedEvent,
	): Promise<void> {
		return this.createResourcesPerHabitat.createResourcesPerHabitat(
			newHabitatEvent,
		);
	}
}
