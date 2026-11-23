import {Injectable} from '@nestjs/common';
import {DataSource, LessThanOrEqual, MoreThanOrEqual} from 'typeorm';

import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {AbstractQueueElementRepository} from '@warp-core/database/repository/abstract-queue-element.repository';

@Injectable()
export class UnitQueueRepository extends AbstractQueueElementRepository<UnitQueueElementModel> {
	constructor(private dataSource: DataSource) {
		super(UnitQueueElementModel, dataSource.createEntityManager());
	}

	public getCurrentQueueForHabitat(
		habitatId: number,
	): Promise<UnitQueueElementModel[]> {
		return this.find({
			where: {
				habitatId: habitatId,
				endTime: MoreThanOrEqual(new Date()),
			},
			order: {endTime: 'ASC', id: 'ASC'},
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
	): Promise<UnitQueueElementModel[]> {
		return this.find({
			where: {
				isConsumed: false,
				endTime: LessThanOrEqual(new Date()),
				habitatId: habitatId,
			},
			order: {endTime: 'ASC', id: 'ASC'},
		});
	}
}
