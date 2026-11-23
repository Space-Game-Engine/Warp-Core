import {Injectable} from '@nestjs/common';
import {DataSource, In} from 'typeorm';

import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class BuildingBlueprintGlobalRepository extends AbstractRepository<BuildingBlueprintGlobalModel> {
	constructor(private dataSource: DataSource) {
		super(BuildingBlueprintGlobalModel, dataSource.createEntityManager());
	}

	public getBuildingById(
		buildingId: string,
	): Promise<BuildingBlueprintGlobalModel | null> {
		return this.findOne({
			where: {
				id: buildingId,
			},
		});
	}

	public getAllBuildings(): Promise<BuildingBlueprintGlobalModel[]> {
		return this.find();
	}

	public getBuildingsByIds(
		buildingIds: string[],
	): Promise<BuildingBlueprintGlobalModel[]> {
		return this.findBy({
			id: In(buildingIds),
		});
	}
}
