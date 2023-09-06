import {Injectable} from '@nestjs/common';
import {
	BuildingModel,
	BuildingProductionRateModel,
} from '@warp-core/database/model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';
import {DataSource, In} from 'typeorm';

@Injectable()
export class BuildingRepository extends AbstractRepository<BuildingModel> {
	constructor(private dataSource: DataSource) {
		super(BuildingModel, dataSource.createEntityManager());
	}

	getBuildingById(buildingId: string): Promise<BuildingModel | null> {
		return this.findOne({
			where: {
				id: buildingId,
			},
		});
	}

	getAllBuildings(): Promise<BuildingModel[]> {
		return this.find();
	}

	getBuildingsByIds(buildingIds: string[]): Promise<BuildingModel[]> {
		return this.findBy({
			id: In(buildingIds),
		});
	}

	async getProductionRateForProvidedLevel(
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

		return await detailsAtSelectedLevel!.productionRate ?? [];
	}
}
