import {Injectable} from '@nestjs/common';
import {DataSource, LessThanOrEqual, MoreThanOrEqual} from 'typeorm';

import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {AbstractQueueElementRepository} from '@warp-core/database/repository/abstract-queue-element.repository';

@Injectable()
export class ResearchQueueRepository extends AbstractQueueElementRepository<ResearchQueueElementModel> {
	constructor(private dataSource: DataSource) {
		super(ResearchQueueElementModel, dataSource.createEntityManager());
	}

	public getCurrentQueueForHabitat(
		habitatId: number,
	): Promise<ResearchQueueElementModel[]> {
		return this.find({
			where: {
				habitatId: habitatId,
				endTime: MoreThanOrEqual(new Date()),
			},
		});
	}

	public getCurrentResearchQueueForResearchNode(
		researchNodeId: string,
		habitatId: number,
	): Promise<ResearchQueueElementModel[]> {
		return this.find({
			where: {
				habitatId: habitatId,
				researchNodeId: researchNodeId,
				endTime: MoreThanOrEqual(new Date()),
			},
		});
	}

	public countActiveQueueElementsForHabitat(
		habitatId: number,
	): Promise<number> {
		return this.count({
			where: {
				habitatId: habitatId,
				endTime: MoreThanOrEqual(new Date()),
			},
		});
	}

	public getUnresolvedQueueForHabitat(
		habitatId: number,
	): Promise<ResearchQueueElementModel[]> {
		return this.findBy({
			isConsumed: false,
			endTime: LessThanOrEqual(new Date()),
			habitatId: habitatId,
		});
	}
}
