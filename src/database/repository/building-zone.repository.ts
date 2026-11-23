import {Injectable} from '@nestjs/common';
import {DataSource, In, IsNull, Not} from 'typeorm';

import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class BuildingZoneRepository extends AbstractRepository<BuildingZoneModel> {
	constructor(private dataSource: DataSource) {
		super(BuildingZoneModel, dataSource.createEntityManager());
	}

	public getAllBuildingZonesByHabitatId(
		habitatId: number,
	): Promise<BuildingZoneModel[]> {
		return this.find({
			where: {
				habitat: {
					id: habitatId,
				},
			},
		});
	}

	public getSingleBuildingZone(
		localBuildingZoneId: number,
		habitatId: number,
	): Promise<BuildingZoneModel | null> {
		return this.findOne({
			where: {
				localBuildingZoneId: localBuildingZoneId,
				habitat: {
					id: habitatId,
				},
			},
		});
	}

	public getSingleBuildingZoneById(
		id: number,
	): Promise<BuildingZoneModel | null> {
		return this.findOne({
			where: {
				id: id,
			},
		});
	}

	/**
	 * Returns building zones of a habitat that have one of provided buildings placed on them.
	 */
	public getBuildingZonesForHabitatAndBuildings(
		habitatId: number,
		buildingIds: string[],
	): Promise<BuildingZoneModel[]> {
		return this.find({
			where: {
				habitatId: habitatId,
				buildingBlueprintPlayer: {
					buildingId: In(buildingIds),
				},
			},
		});
	}

	/**
	 * Returns building zones of a habitat that have any building placed on them.
	 */
	public getBuiltBuildingZonesForHabitat(
		habitatId: number,
	): Promise<BuildingZoneModel[]> {
		return this.find({
			where: {
				habitatId: habitatId,
				buildingBlueprintPlayerId: Not(IsNull()),
			},
		});
	}

	public async getMaxOfCounterPerHabitat(habitatId: number): Promise<number> {
		const allBuildingZones =
			await this.getAllBuildingZonesByHabitatId(habitatId);
		let maxCounterValue = 0;

		for (const singleBuildingZone of allBuildingZones) {
			if (singleBuildingZone.localBuildingZoneId > maxCounterValue) {
				maxCounterValue = singleBuildingZone.localBuildingZoneId;
			}
		}

		return maxCounterValue;
	}
}
