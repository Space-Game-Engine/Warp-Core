import {Injectable} from '@nestjs/common';
import {DataSource, LessThanOrEqual, MoreThanOrEqual} from 'typeorm';

import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class BuildingQueueRepository extends AbstractRepository<BuildingQueueElementModel> {
	constructor(private dataSource: DataSource) {
		super(BuildingQueueElementModel, dataSource.createEntityManager());
	}

	public getCurrentBuildingQueueForHabitat(
		habitatId: number,
	): Promise<BuildingQueueElementModel[]> {
		return this.find({
			where: {
				buildingZone: {
					habitatId: habitatId,
				},
				endTime: MoreThanOrEqual(new Date()),
			},
		});
	}

	public getCurrentBuildingQueueForBuildingZone(
		buildingZone: BuildingZoneModel,
	): Promise<BuildingQueueElementModel[]> {
		return this.find({
			where: {
				buildingZone: {
					id: buildingZone.id,
				},
				endTime: MoreThanOrEqual(new Date()),
			},
		});
	}

	public getSingleBuildingQueueElementById(
		queueElementId: number,
	): Promise<BuildingQueueElementModel | null> {
		return this.findOne({
			where: {
				id: queueElementId,
			},
		});
	}

	public countActiveBuildingQueueElementsForHabitat(
		habitatId: number,
	): Promise<number> {
		return this.count({
			where: {
				buildingZone: {
					habitatId: habitatId,
				},
				endTime: MoreThanOrEqual(new Date()),
			},
		});
	}

	public getUnresolvedQueueForHabitat(
		habitatId: number,
	): Promise<BuildingQueueElementModel[]> {
		return this.findBy({
			isConsumed: false,
			endTime: LessThanOrEqual(new Date()),
			buildingZone: {
				habitatId: habitatId,
			},
		});
	}

	public getUnresolvedQueueForSingleBuildingZone(
		buildingZoneId: number,
	): Promise<BuildingQueueElementModel[]> {
		const queryBuilder = this.createQueryBuilder('buildingQueue');
		queryBuilder
			.where('buildingQueue.isConsumed = false')
			.andWhere('endTime <= :date', {date: new Date()})
			.andWhere('buildingQueue.buildingZoneId = :buildingZoneId', {
				buildingZoneId: buildingZoneId,
			});

		return queryBuilder.getMany();
	}
}
