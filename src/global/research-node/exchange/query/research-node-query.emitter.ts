import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchNodeQueryNames} from '@warp-core/global/research-node/exchange/query/research-node-query.names';

@Injectable()
export class ResearchNodeQueryEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public getResearchNodeById(
		researchNodeId: string,
	): Promise<QueryExchangeResponse<ResearchNodeModel | null>> {
		return this.emitter.query<ResearchNodeModel | null>({
			eventName: ResearchNodeQueryNames.GetResearchNodeById,
			requestData: {id: researchNodeId},
		});
	}

	public calculateTimeInSecondsToUpgradeResearchNode(inputData: {
		startLevel: number;
		endLevel: number;
		researchNodeId: string;
	}): Promise<QueryExchangeResponse<number>> {
		return this.emitter.query<number>({
			eventName:
				ResearchNodeQueryNames.CalculateTimeInSecondsToUpgradeResearchNode,
			requestData: inputData,
		});
	}
}
