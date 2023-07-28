import {Injectable} from '@nestjs/common';
import {HabitatModel} from '@warp-core/database/model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';
import {DataSource} from 'typeorm';

@Injectable()
export class HabitatRepository extends AbstractRepository<HabitatModel> {
	constructor(private dataSource: DataSource) {
		super(HabitatModel, dataSource.createEntityManager());
	}

	getHabitatById(habitatId: number): Promise<HabitatModel | null> {
		return this.findOne({
			where: {
				id: habitatId,
			},
		});
	}

	getHabitatsByUserId(userId: number): Promise<HabitatModel[]> {
		return this.find({
			where: {
				userId: userId,
			},
		});
	}
}
