import {Args, ID, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {BuildingService} from './building.service';

import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building-details-at-certain-level.model';
import {BuildingModel} from '@warp-core/database/model/building.model';

@Resolver(() => BuildingModel)
export class BuildingResolver {
	constructor(private readonly buildingService: BuildingService) {}

	@Query(() => BuildingModel, {
		nullable: true,
		description: 'Returns single building type',
		name: 'building_get',
	})
	public building(
		@Args('id', {type: () => ID}) id: string,
	): Promise<BuildingModel | null> {
		return this.buildingService.getBuildingById(id);
	}

	@Query(() => [BuildingModel], {
		nullable: true,
		description: 'Returns all possible building types',
		name: 'building_getAll',
	})
	public allBuildings(): Promise<BuildingModel[]> {
		return this.buildingService.getAllBuildings();
	}

	@ResolveField()
	public async buildingDetailsAtCertainLevel(
		@Parent() building: BuildingModel,
	): Promise<BuildingDetailsAtCertainLevelModel[]> {
		return building.buildingDetailsAtCertainLevel;
	}
}
