import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class UnitInstanceRepository extends AbstractRepository<UnitInstanceModel> {
	constructor(private dataSource: DataSource) {
		super(UnitInstanceModel, dataSource.createEntityManager());
	}

	public getAllUnitInstancesForHabitat(
		habitatId: number,
	): Promise<UnitInstanceModel[]> {
		return this.find({
			where: {habitatId: habitatId},
			order: {id: 'ASC'},
		});
	}
}
