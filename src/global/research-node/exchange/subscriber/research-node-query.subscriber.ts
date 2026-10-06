import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchNodeQueryNames} from '@warp-core/global/research-node/exchange/query/research-node-query.names';
import {ResearchNodeService} from '@warp-core/global/research-node/research-node.service';

@Injectable()
export class ResearchNodeQuerySubscriber {
	constructor(private readonly researchNodeService: ResearchNodeService) {}

	@InternalExchangeQuery(ResearchNodeQueryNames.GetResearchNodeById)
	public getResearchNodeById({
		id,
	}: {
		id: string;
	}): Promise<ResearchNodeModel | null> {
		return this.researchNodeService.getResearchNodeById(id);
	}

	@InternalExchangeQuery(
		ResearchNodeQueryNames.CalculateTimeInSecondsToUpgradeResearchNode,
	)
	public calculateTimeInSecondsToUpgradeResearchNode(inputData: {
		startLevel: number;
		endLevel: number;
		researchNodeId: string;
	}): Promise<number> {
		return this.researchNodeService.calculateTimeInSecondsToUpgradeResearchNode(
			inputData,
		);
	}
}
