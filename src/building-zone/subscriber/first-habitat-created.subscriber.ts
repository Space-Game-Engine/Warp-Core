import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {BuildingZoneService} from '@warp-core/building-zone/building-zone.service';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {
	BuildingRepository,
	BuildingZoneModel,
	BuildingZoneRepository,
} from '@warp-core/database';
import {HabitatCreatedEvent} from '@warp-core/habitat';

@Injectable()
export class FirstHabitatCreatedSubscriber {
	constructor(
		private readonly runtimeConfig: RuntimeConfig,
		private readonly buildingZoneService: BuildingZoneService,
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly buildingRepository: BuildingRepository,
	) {}

	@OnEvent('habitat.created.after_registration')
	public async addBuildingsOnFirstHabitatCreation(
		payload: HabitatCreatedEvent,
	): Promise<void> {
		if (
			!this.runtimeConfig.habitat.onStart.buildings ||
			this.runtimeConfig.habitat.onStart.buildings.length === 0
		) {
			return;
		}

		const habitat = payload.habitat;
		const buildingsToBuildFromConfiguration =
			this.runtimeConfig.habitat.onStart.buildings;
		const buildingsToBuild = await this.buildingRepository.getBuildingsByIds(
			buildingsToBuildFromConfiguration.map(
				singleBuildingFromConfig => singleBuildingFromConfig.id,
			),
		);

		for (const habitatBuildingsConfig of buildingsToBuildFromConfiguration) {
			const buildingZone =
				(await this.buildingZoneService.getSingleBuildingZone(
					habitatBuildingsConfig.localBuildingZoneId,
					habitat,
				)) as BuildingZoneModel;

			buildingZone.buildingId = buildingsToBuild.find(
				singleBuilding => singleBuilding.id === habitatBuildingsConfig.id,
			)!.id;

			buildingZone.level = habitatBuildingsConfig.level;

			await this.buildingZoneRepository.update(buildingZone.id, {
				buildingId: buildingZone.buildingId,
				level: buildingZone.level,
			});
		}
	}
}
