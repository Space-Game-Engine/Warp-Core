import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {BuildingBlueprintPlayerRepository} from '@warp-core/database/repository/building-blueprint-player.repository';
import {AbstractBlueprintPlayerService} from '@warp-core/user/blueprint/core';

@Injectable()
export class BuildingBlueprintPlayerService extends AbstractBlueprintPlayerService<
	BuildingBlueprintGlobalModel,
	BuildingBlueprintPlayerModel
> {
	constructor(
		private readonly buildingBlueprintPlayerRepository: BuildingBlueprintPlayerRepository,
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
