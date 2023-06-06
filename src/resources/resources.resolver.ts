import { Args, ID, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { AuthorizedHabitatModel } from "@warp-core/auth";
import { HabitatResourceCombined } from "@warp-core/database";
import { ResourcesService } from "@warp-core/resources/resources.service";

@Resolver(() => HabitatResourceCombined)
export class ResourcesResolver {
    constructor(
        private readonly resourcesService: ResourcesService,
        private readonly habitatModel: AuthorizedHabitatModel,
    ) { }

    @Query(() => HabitatResourceCombined, {description: "Returns single resource type defined in game", name: 'resource_get'})
    resource(
        @Args('id', {type: () => ID}) id: string
    ) {
        return this.resourcesService.getSingleResourceById(id);
    }

    @Query(() => [HabitatResourceCombined], {description: "Returns all resource types", name: "resource_getAll"})
    allResources() {
        return this.resourcesService.getAllResourcesForHabitat();
    }

    @ResolveField()
    habitat(
        @Parent() resource: HabitatResourceCombined
    ) {
        return this.habitatModel;
    }
}