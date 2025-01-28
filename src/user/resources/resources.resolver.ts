import {Args, ID, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResourceCombined} from '@warp-core/database';
import {ResourcesService} from '@warp-core/user/resources/resources.service';

@Resolver(() => HabitatResourceCombined)
export class ResourcesResolver {
	constructor(
		private readonly resourcesService: ResourcesService,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	@Query(() => HabitatResourceCombined, {
		description: 'Returns single resource type defined in game',
		name: 'resource_get',
	})
	public resource(
		@Args('id', {type: () => ID}) id: string,
	): Promise<HabitatResourceCombined | null> {
		return this.resourcesService.getSingleResourceById(id);
	}

	@Query(() => [HabitatResourceCombined], {
		description: 'Returns all resource types',
		name: 'resource_getAll',
	})
	public allResources(): Promise<HabitatResourceCombined[]> {
		return this.resourcesService.getAllResourcesForHabitat();
	}

	@ResolveField()
	public habitat(
		@Parent() resource: HabitatResourceCombined,
	): AuthorizedHabitatModel {
		return this.habitatModel;
	}
}
