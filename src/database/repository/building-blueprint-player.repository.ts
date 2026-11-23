import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {AbstractBlueprintPlayerRepository} from '@warp-core/database/repository/abstract-blueprint-player.repository';

@Injectable()
export class BuildingBlueprintPlayerRepository extends AbstractBlueprintPlayerRepository<BuildingBlueprintPlayerModel> {
	constructor(private dataSource: DataSource) {
		super(BuildingBlueprintPlayerModel, dataSource.createEntityManager());
	}

	public getForHabitatAndGlobalBlueprint(
		habitatId: number,
		buildingId: string,
	): Promise<BuildingBlueprintPlayerModel | null> {
		return this.findOne({
			where: {
				habitatId: habitatId,
				buildingId: buildingId,
			},
		});
	}

	public getAllForHabitat(
		habitatId: number,
	): Promise<BuildingBlueprintPlayerModel[]> {
		return this.find({
			where: {
				habitatId: habitatId,
			},
		});
	}
}
