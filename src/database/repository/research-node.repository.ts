import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class ResearchNodeRepository extends AbstractRepository<ResearchNodeModel> {
	constructor(private dataSource: DataSource) {
		super(ResearchNodeModel, dataSource.createEntityManager());
	}

	public getResearchNodeById(
		researchNodeId: string,
	): Promise<ResearchNodeModel | null> {
		return this.findOne({
			where: {
				id: researchNodeId,
			},
		});
	}

	public getAllResearchNodes(): Promise<ResearchNodeModel[]> {
		return this.find();
	}
}
