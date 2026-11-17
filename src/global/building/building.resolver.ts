import {Args, ID, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {BuildingService} from './building.service';

import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building/building-details-at-certain-level.model';

@Resolver(() => BuildingBlueprintGlobalModel)
export class BuildingResolver {
	constructor(private readonly buildingService: BuildingService) {}

	@Query(() => BuildingBlueprintGlobalModel, {
		nullable: true,
		description: 'Returns single building type',
		name: 'building_get',
	})
	public building(
		@Args('id', {type: () => ID}) id: string,
	): Promise<BuildingBlueprintGlobalModel | null> {
		return this.buildingService.getBuildingById(id);
	}

	@Query(() => [BuildingBlueprintGlobalModel], {
		nullable: true,
		description: 'Returns all possible building types',
		name: 'building_getAll',
	})
	public allBuildings(): Promise<BuildingBlueprintGlobalModel[]> {
		return this.buildingService.getAllBuildings();
	}

	@ResolveField()
	public async buildingDetailsAtCertainLevel(
		@Parent() building: BuildingBlueprintGlobalModel,
	): Promise<BuildingDetailsAtCertainLevelModel[]> {
		return building.buildingDetailsAtCertainLevel;
	}
}
