import {Injectable} from '@nestjs/common';
import {DataSource, In} from 'typeorm';

import {
	BuildingModel,
	BuildingProductionRateModel,
} from '@warp-core/database/model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class BuildingRepository extends AbstractRepository<BuildingModel> {
	constructor(private dataSource: DataSource) {
		super(BuildingModel, dataSource.createEntityManager());
	}

	public getBuildingById(buildingId: string): Promise<BuildingModel | null> {
		return this.findOne({
			where: {
				id: buildingId,
			},
		});
	}

	public getAllBuildings(): Promise<BuildingModel[]> {
		return this.find();
	}

	public getBuildingsByIds(buildingIds: string[]): Promise<BuildingModel[]> {
		return this.findBy({
			id: In(buildingIds),
		});
	}

	public async getProductionRateForProvidedLevel(
		buildingId: string,
		buildingLevel: number,
	): Promise<BuildingProductionRateModel[]> {
		const buildingModel = await this.getBuildingById(buildingId);
		if (buildingModel == null) {
			return [];
		}

		const detailsAtSelectedLevel = (
			await buildingModel.buildingDetailsAtCertainLevel
		).find(buildingDetails => buildingDetails.level === buildingLevel);

		return (await detailsAtSelectedLevel!.productionRate) ?? [];
	}
}
