import {Injectable} from '@nestjs/common';

import {calculateUpgradeTimeInSeconds} from '@warp-core/core/utils';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchNodeRepository} from '@warp-core/database/repository/research-node.repository';

@Injectable()
export class ResearchNodeService {
	constructor(private researchNodeRepository: ResearchNodeRepository) {}

	public getResearchNodeById(
		researchNodeId: string,
	): Promise<ResearchNodeModel | null> {
		return this.researchNodeRepository.getResearchNodeById(researchNodeId);
	}

	public getAllResearchNodes(): Promise<ResearchNodeModel[]> {
		return this.researchNodeRepository.getAllResearchNodes();
	}

	public async calculateTimeInSecondsToUpgradeResearchNode(inputData: {
		startLevel: number;
		endLevel: number;
		researchNodeId: string;
	}): Promise<number> {
		const researchNode = await this.researchNodeRepository.getResearchNodeById(
			inputData.researchNodeId,
		);

		if (!researchNode) {
			throw new Error('Research node does not exists');
		}

		const researchNodeDetails =
			await researchNode.researchNodeDetailsAtCertainLevel;

		return calculateUpgradeTimeInSeconds(
			researchNodeDetails.map(singleDetails => singleDetails.details),
			inputData.startLevel,
			inputData.endLevel,
		);
	}
}
