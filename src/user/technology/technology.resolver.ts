import {Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {TechnologyService} from '@warp-core/user/technology/service/technology.service';

@Resolver(() => HabitatResearchNodeModel)
export class TechnologyResolver {
	constructor(private readonly technologyService: TechnologyService) {}

	@Query(() => [HabitatResearchNodeModel], {
		description: 'Returns research nodes developed in logged in habitat',
		name: 'technology_getAll',
	})
	public getTechnologies(): Promise<HabitatResearchNodeModel[]> {
		return this.technologyService.getTechnologiesForLoggedIn();
	}

	@ResolveField()
	public async researchNode(
		@Parent() habitatResearchNode: HabitatResearchNodeModel,
	): Promise<ResearchNodeModel> {
		return habitatResearchNode.researchNode;
	}
}
