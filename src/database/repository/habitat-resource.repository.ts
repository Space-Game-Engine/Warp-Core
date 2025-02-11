import {Injectable} from '@nestjs/common';
import {DataSource, In} from 'typeorm';

import {BuildingProductionRateModel} from '@warp-core/database/model/building-production-rate.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class HabitatResourceRepository extends AbstractRepository<HabitatResourceModel> {
	constructor(private dataSource: DataSource) {
		super(HabitatResourceModel, dataSource.createEntityManager());
	}

	public getHabitatResourceByBuildingAndLevel(
		building: BuildingModel | string,
		level: number,
		habitatId: number,
	): Promise<HabitatResourceModel[]> {
		let buildingId: string;

		if (building instanceof BuildingModel) {
			buildingId = building.id;
		} else {
			buildingId = building;
		}

		const queryBuilder = this.createQueryBuilder('habitatResource');

		queryBuilder
			.select()
			.innerJoin(
				BuildingProductionRateModel,
				'productionRate',
				'habitatResource.resourceId = productionRate.resourceId',
			)
			.innerJoin('productionRate.buildingDetails', 'buildingDetails')
			.where('buildingDetails.buildingId = :buildingId', {
				buildingId: buildingId,
			})
			.andWhere('buildingDetails.level = :level', {level: level})
			.andWhere('habitatResource.habitatId = :habitatId', {
				habitatId: habitatId,
			});

		return queryBuilder.getMany();
	}

	public getHabitatResourcesByIds(
		resourcesIds: string[],
		habitatId: number,
	): Promise<HabitatResourceModel[]> {
		return this.findBy({
			resourceId: In(resourcesIds),
			habitatId: habitatId,
		});
	}

	public updateLastCalculationDateForManyResources(
		resourceIds: string[],
		habitatId: number,
		lastCalculationTime: Date,
	): void {
		this.createQueryBuilder()
			.update(HabitatResourceModel)
			.set({lastCalculationTime: lastCalculationTime})
			.where('resourceId in :resourceIds', {resourceIds: resourceIds})
			.andWhere('habitatId = :habitatId', {habitatId: habitatId});
	}
}
