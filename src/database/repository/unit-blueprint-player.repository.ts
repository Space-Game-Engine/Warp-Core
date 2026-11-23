import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {UnitBlueprintPlayerModel} from '@warp-core/database/model/unit/unit-blueprint-player.model';
import {AbstractBlueprintPlayerRepository} from '@warp-core/database/repository/abstract-blueprint-player.repository';

@Injectable()
export class UnitBlueprintPlayerRepository extends AbstractBlueprintPlayerRepository<UnitBlueprintPlayerModel> {
	constructor(private dataSource: DataSource) {
		super(UnitBlueprintPlayerModel, dataSource.createEntityManager());
	}

	public getForHabitatAndGlobalBlueprint(
		habitatId: number,
		unitId: string,
	): Promise<UnitBlueprintPlayerModel | null> {
		return this.findOne({
			where: {
				habitatId: habitatId,
				unitId: unitId,
			},
		});
	}

	public getAllForHabitat(
		habitatId: number,
	): Promise<UnitBlueprintPlayerModel[]> {
		return this.find({
			where: {
				habitatId: habitatId,
			},
		});
	}
}
