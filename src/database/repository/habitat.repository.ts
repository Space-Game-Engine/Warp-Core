import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class HabitatRepository extends AbstractRepository<HabitatModel> {
	constructor(private dataSource: DataSource) {
		super(HabitatModel, dataSource.createEntityManager());
	}

	public getHabitatById(habitatId: number): Promise<HabitatModel | null> {
		return this.findOne({
			where: {
				id: habitatId,
			},
		});
	}

	public getHabitatsByUserId(userId: number): Promise<HabitatModel[]> {
		return this.find({
			where: {
				userId: userId,
			},
		});
	}
}
