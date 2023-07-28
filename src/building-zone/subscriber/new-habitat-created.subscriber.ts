import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {HabitatCreatedEvent} from '@warp-core/habitat';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneService} from '@warp-core/building-zone/building-zone.service';

@Injectable()
export class NewHabitatCreatedSubscriber {
	constructor(
		private readonly runtimeConfig: RuntimeConfig,
		private readonly buildingZoneService: BuildingZoneService,
	) {}

	@OnEvent('habitat.created.after_save')
	async createBuildingZoneOnNewHabitatCreation(
		payload: HabitatCreatedEvent,
		transactionId: string,
	) {
		const counterForNewHabitat =
			this.runtimeConfig.habitat.buildingZones.counterForNewHabitat;
		for (
			let buildingZoneCounter = 0;
			buildingZoneCounter < counterForNewHabitat;
			buildingZoneCounter++
		) {
			await this.buildingZoneService.createNewBuildingZone(
				payload.habitat,
				transactionId,
			);
		}
	}
}
