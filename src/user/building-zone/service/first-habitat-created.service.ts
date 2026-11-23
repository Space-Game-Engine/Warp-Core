import {Injectable} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {BuildingBlueprintQueryEmitter} from '@warp-core/user/blueprint/building-blueprint';
import {BuildingZoneService} from '@warp-core/user/building-zone/service/building-zone.service';
import {HabitatCreatedEvent} from '@warp-core/user/habitat';

@Injectable()
export class FirstHabitatCreatedService {
	constructor(
		private readonly runtimeConfig: RuntimeConfig,
		private readonly buildingZoneService: BuildingZoneService,
		private readonly buildingRepository: BuildingBlueprintGlobalRepository,
		private readonly buildingBlueprintEmitter: BuildingBlueprintQueryEmitter,
	) {}

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

			const building = buildingsToBuild.find(
				singleBuilding => singleBuilding.id === habitatBuildingsConfig.id,
			)!;

			const {error} =
				await this.buildingBlueprintEmitter.assignBlueprintToBuildingZone({
					buildingZone,
					buildingId: building.id,
					level: habitatBuildingsConfig.level,
				});

			if (error) {
				throw new InternalEmitterError(error.message);
			}
		}
	}
}
