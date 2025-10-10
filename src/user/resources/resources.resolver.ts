import {Args, ID, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {ResourcesService} from '@warp-core/user/resources/service/resources.service';

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
		return this.resourcesService.getSingleResourceById(
			this.habitatModel.id,
			id,
		);
	}

	@Query(() => [HabitatResourceCombined], {
		description: 'Returns all resource types',
		name: 'resource_getAll',
	})
	public allResources(): Promise<HabitatResourceCombined[]> {
		return this.resourcesService.getAllResourcesForHabitat(
			this.habitatModel.id,
		);
	}

	@ResolveField()
	public habitat(
		@Parent() resource: HabitatResourceCombined,
	): AuthorizedHabitatModel {
		return this.habitatModel;
	}

	@ResolveField('productionRate', () => Number)
	public async productionRate(
		@Parent() habitatResource: HabitatResourceCombined,
	): Promise<number> {
		return this.resourcesService.getProductionRateForResource(habitatResource);
	}
}
