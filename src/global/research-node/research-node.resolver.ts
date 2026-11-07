import {Args, ID, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {ResearchNodeDetailsAtCertainLevelModel} from '@warp-core/database/model/research-node/research-node-details-at-certain-level.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchNodeService} from '@warp-core/global/research-node/research-node.service';

@Resolver(() => ResearchNodeModel)
export class ResearchNodeResolver {
	constructor(private readonly researchNodeService: ResearchNodeService) {}

	@Query(() => ResearchNodeModel, {
		nullable: true,
		description: 'Returns single research node',
		name: 'researchNode_get',
	})
	public researchNode(
		@Args('id', {type: () => ID}) id: string,
	): Promise<ResearchNodeModel | null> {
		return this.researchNodeService.getResearchNodeById(id);
	}

	@Query(() => [ResearchNodeModel], {
		description: 'Returns all possible research nodes',
		name: 'researchNode_getAll',
	})
	public allResearchNodes(): Promise<ResearchNodeModel[]> {
		return this.researchNodeService.getAllResearchNodes();
	}

	@ResolveField()
	public async researchNodeDetailsAtCertainLevel(
		@Parent() researchNode: ResearchNodeModel,
	): Promise<ResearchNodeDetailsAtCertainLevelModel[]> {
		return researchNode.researchNodeDetailsAtCertainLevel;
	}
}
