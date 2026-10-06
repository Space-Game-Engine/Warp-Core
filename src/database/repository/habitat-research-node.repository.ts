import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class HabitatResearchNodeRepository extends AbstractRepository<HabitatResearchNodeModel> {
	constructor(private dataSource: DataSource) {
		super(HabitatResearchNodeModel, dataSource.createEntityManager());
	}

	public getForHabitatAndResearchNode(
		habitatId: number,
		researchNodeId: string,
	): Promise<HabitatResearchNodeModel | null> {
		return this.findOne({
			where: {
				habitatId: habitatId,
				researchNodeId: researchNodeId,
			},
		});
	}
}
