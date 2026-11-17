import {Injectable} from '@nestjs/common';

import {sumCapabilities} from '@warp-core/core/utils';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {BuildingBlueprintPlayerRepository} from '@warp-core/database/repository/building-blueprint-player.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {
	BuildingZoneCapabilities,
	CalculateCapabilitiesInput,
} from '@warp-core/user/building-zone/exchange/query/types';

/**
 * Calculates effective capabilities of buildings:
 * global blueprint capabilities on certain level plus player blueprint bonuses.
 */
@Injectable()
export class CalculateBuildingZoneCapabilitiesService {
	constructor(
		private readonly buildingBlueprintGlobalRepository: BuildingBlueprintGlobalRepository,
		private readonly buildingBlueprintPlayerRepository: BuildingBlueprintPlayerRepository,
		private readonly buildingZoneRepository: BuildingZoneRepository,
	) {}

	public async calculate({
		habitatId,
		buildingId,
		level,
	}: CalculateCapabilitiesInput): Promise<CalculatedCapabilitiesModel> {
		const [globalCapabilities, playerCapabilities] = await Promise.all([
			this.getGlobalCapabilities(buildingId, level),
			this.getPlayerCapabilities(habitatId, buildingId),
		]);

		return sumCapabilities([globalCapabilities, playerCapabilities]);
	}

	public async forBuildingZone(
		buildingZone: BuildingZoneModel,
		level: number = buildingZone.level,
	): Promise<CalculatedCapabilitiesModel | null> {
		const playerBlueprint = await buildingZone.getPlayerBlueprint();

		if (!playerBlueprint) {
			return null;
		}

		return this.calculate({
			habitatId: buildingZone.habitatId,
			buildingId: playerBlueprint.buildingId,
			level: level,
		});
	}

	public async forHabitat(
		habitatId: number,
	): Promise<BuildingZoneCapabilities[]> {
		const buildingZones =
			await this.buildingZoneRepository.getBuiltBuildingZonesForHabitat(
				habitatId,
			);
		const zonesCapabilities: BuildingZoneCapabilities[] = [];

		for (const buildingZone of buildingZones) {
			const capabilities = await this.forBuildingZone(buildingZone);

			if (!capabilities) {
				continue;
			}

			zonesCapabilities.push({buildingZone, capabilities});
		}

		return zonesCapabilities;
	}

	private async getGlobalCapabilities(
		buildingId: string,
		level: number,
	): Promise<CapabilitiesModel | null> {
		const building =
			await this.buildingBlueprintGlobalRepository.getBuildingById(buildingId);

		if (!building) {
			return null;
		}

		const levelDetails = (await building.buildingDetailsAtCertainLevel).find(
			buildingDetails => buildingDetails.details.level === level,
		);

		return levelDetails?.capabilities ?? null;
	}

	private async getPlayerCapabilities(
		habitatId: number,
		buildingId: string,
	): Promise<CapabilitiesModel | null> {
		const playerBlueprint =
			await this.buildingBlueprintPlayerRepository.getForHabitatAndGlobalBlueprint(
				habitatId,
				buildingId,
			);

		return playerBlueprint?.capabilities ?? null;
	}
}
