import {Args, ID, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {BuildingBlueprintPlayerService} from '@warp-core/user/blueprint/building-blueprint/service/building-blueprint-player.service';

@Resolver(() => BuildingBlueprintPlayerModel)
export class BuildingBlueprintResolver {
	constructor(
		private readonly buildingBlueprintPlayerService: BuildingBlueprintPlayerService,
	) {}

	@Query(() => BuildingBlueprintPlayerModel, {
		nullable: true,
		description:
			'Returns player building blueprint of logged in habitat for provided global building id',
		name: 'buildingBlueprint_get',
	})
	public buildingBlueprint(
		@Args('buildingId', {type: () => ID}) buildingId: string,
	): Promise<BuildingBlueprintPlayerModel | null> {
		return this.buildingBlueprintPlayerService.getForCurrentHabitatAndBuilding(
			buildingId,
		);
	}

	@Query(() => [BuildingBlueprintPlayerModel], {
		description: 'Returns all player building blueprints of logged in habitat',
		name: 'buildingBlueprint_getAll',
	})
	public allBuildingBlueprints(): Promise<BuildingBlueprintPlayerModel[]> {
		return this.buildingBlueprintPlayerService.getAllForCurrentHabitat();
	}

	@ResolveField()
	public building(
		@Parent() buildingBlueprint: BuildingBlueprintPlayerModel,
	): Promise<BuildingBlueprintGlobalModel> {
		return buildingBlueprint.getGlobalBlueprint();
	}

	@ResolveField()
	public async habitat(
		@Parent() buildingBlueprint: BuildingBlueprintPlayerModel,
	): Promise<HabitatModel> {
		return buildingBlueprint.habitat;
	}

	@ResolveField()
	public async buildingZones(
		@Parent() buildingBlueprint: BuildingBlueprintPlayerModel,
	): Promise<BuildingZoneModel[]> {
		return buildingBlueprint.buildingZones;
	}
}
