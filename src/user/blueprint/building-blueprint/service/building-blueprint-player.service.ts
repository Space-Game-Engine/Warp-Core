import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {BuildingBlueprintPlayerRepository} from '@warp-core/database/repository/building-blueprint-player.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {AbstractBlueprintPlayerService} from '@warp-core/user/blueprint/core';

@Injectable()
export class BuildingBlueprintPlayerService extends AbstractBlueprintPlayerService<
	BuildingBlueprintGlobalModel,
	BuildingBlueprintPlayerModel
> {
	constructor(
		private readonly buildingBlueprintPlayerRepository: BuildingBlueprintPlayerRepository,
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {
		super(buildingBlueprintPlayerRepository);
	}

	public getAllForCurrentHabitat(): Promise<BuildingBlueprintPlayerModel[]> {
		return this.buildingBlueprintPlayerRepository.getAllForHabitat(
			this.habitatModel.id,
		);
	}

	public getForCurrentHabitatAndBuilding(
		buildingId: string,
	): Promise<BuildingBlueprintPlayerModel | null> {
		return this.buildingBlueprintPlayerRepository.getForHabitatAndGlobalBlueprint(
			this.habitatModel.id,
			buildingId,
		);
	}

	/**
	 * Sets level on provided building zone and, when the zone does not have a player blueprint yet,
	 * gets or creates the one for the building. Changes are saved and applied to provided model.
	 */
	public async assignToBuildingZone(
		buildingZone: BuildingZoneModel,
		buildingId: string,
		level: number,
	): Promise<void> {
		if (!buildingZone.buildingBlueprintPlayerId) {
			const playerBlueprint = await this.getOrCreateForHabitat(
				buildingZone.habitatId,
				buildingId,
			);
			buildingZone.buildingBlueprintPlayerId = playerBlueprint.id;
		}

		buildingZone.level = level;

		await this.buildingZoneRepository.update(buildingZone.id, {
			buildingBlueprintPlayerId: buildingZone.buildingBlueprintPlayerId,
			level: buildingZone.level,
		});
	}

	protected createDraft(
		habitatId: number,
		buildingId: string,
	): BuildingBlueprintPlayerModel {
		const capabilities = new CapabilitiesModel();
		capabilities.production = [];
		capabilities.storage = [];

		return this.buildingBlueprintPlayerRepository.create({
			habitatId: habitatId,
			buildingId: buildingId,
			capabilities: capabilities,
		});
	}
}
