import {Injectable} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneService} from '@warp-core/user/building-zone/service/building-zone.service';
import {HabitatCreatedEvent} from '@warp-core/user/habitat';

@Injectable()
export class NewHabitatCreatedService {
	constructor(
		private readonly runtimeConfig: RuntimeConfig,
		private readonly buildingZoneService: BuildingZoneService,
	) {}

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
