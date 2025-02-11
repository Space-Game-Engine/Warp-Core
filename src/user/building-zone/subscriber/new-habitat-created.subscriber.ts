import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneService} from '@warp-core/user/building-zone/building-zone.service';
import {HabitatCreatedEvent} from '@warp-core/user/habitat';

@Injectable()
export class NewHabitatCreatedSubscriber {
	constructor(
		private readonly runtimeConfig: RuntimeConfig,
		private readonly buildingZoneService: BuildingZoneService,
	) {}

	@OnEvent('habitat.created.after_save')
	public async createBuildingZoneOnNewHabitatCreation(
		payload: HabitatCreatedEvent,
	): Promise<void> {
		const counterForNewHabitat =
			this.runtimeConfig.habitat.buildingZones.counterForNewHabitat;
		for (
			let buildingZoneCounter = 0;
			buildingZoneCounter < counterForNewHabitat;
			buildingZoneCounter++
		) {
			await this.buildingZoneService.createNewBuildingZone(payload.habitat);
		}
	}
}
