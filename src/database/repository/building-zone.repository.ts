import {Injectable} from '@nestjs/common';
import {
	BuildingZoneModel,
	HabitatModel,
	ResourceModel,
	WarehouseDetailsModel,
} from '@warp-core/database/model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';
import {DataSource, FindOptionsUtils} from 'typeorm';

@Injectable()
export class BuildingZoneRepository extends AbstractRepository<BuildingZoneModel> {
	constructor(private dataSource: DataSource) {
		super(BuildingZoneModel, dataSource.createEntityManager());
	}

	async getAllBuildingZonesByHabitatId(
		habitatId: number,
	): Promise<BuildingZoneModel[]> {
		const buildingZones = await this.find({
			where: {
				habitat: {
					id: habitatId,
				},
			},
		});

		return buildingZones;
	}

	async getSingleBuildingZone(
		localBuildingZoneId: number,
		habitatId: number,
	): Promise<BuildingZoneModel | null> {
		const singleBuildingZone = await this.findOne({
			where: {
				localBuildingZoneId: localBuildingZoneId,
				habitat: {
					id: habitatId,
				},
			},
		});

		return singleBuildingZone;
	}

	async getSingleBuildingZoneById(
		id: number,
	): Promise<BuildingZoneModel | null> {
		const singleBuildingZone = await this.findOne({
			where: {
				id: id,
			},
		});

		return singleBuildingZone;
	}

	async getMaxOfCounterPerHabitat(habitatId: number): Promise<number> {
		const allBuildingZones = await this.getAllBuildingZonesByHabitatId(
			habitatId,
		);
		let maxCounterValue = 0;

		for (const singleBuildingZone of allBuildingZones) {
			if (singleBuildingZone.localBuildingZoneId > maxCounterValue) {
				maxCounterValue = singleBuildingZone.localBuildingZoneId;
			}
		}

		return maxCounterValue;
	}

	getBuildingZoneProducersForSingleResource(
		habitat: HabitatModel | number,
		resourceType: ResourceModel,
	): Promise<BuildingZoneModel[]> {
		let habitatId: number;

		if (habitat instanceof HabitatModel) {
			habitatId = habitat.id;
		} else {
			habitatId = habitat;
		}

		const queryBuilder = this.createQueryBuilder('buildingZone');
		FindOptionsUtils.joinEagerRelations(
			queryBuilder,
			'buildingZone',
			this.metadata,
		);
		queryBuilder
			.select()
			.innerJoinAndSelect('buildingZone.building', 'building')
			.innerJoinAndSelect(
				'building.buildingDetailsAtCertainLevel',
				'details',
				'buildingZone.level = details.level',
			)
			.innerJoinAndSelect('details.productionRate', 'productionRate')
			.where('buildingZone.habitatId = :habitatId', {habitatId: habitatId})
			.andWhere('productionRate.resourceId = :resourceId', {
				resourceId: resourceType.id,
			});

		return queryBuilder.getMany();
	}

	async getWarehouseForResourceAndHabitat(
		resource: ResourceModel,
		habitatId: number,
	): Promise<WarehouseDetailsModel[]> {
		const buildingZonesForHabitat = await this.getAllBuildingZonesByHabitatId(
			habitatId,
		);
		const warehouses = (
			await Promise.all(
				buildingZonesForHabitat.map(async singleBuildingZone => {
					if ((await singleBuildingZone.hasWarehouse()) === false) {
						return [];
					}
					const buildingLevelDetails =
						await singleBuildingZone.getBuildingLevelDetails();
					return buildingLevelDetails.warehouse;
				}),
			)
		).flat();

		return warehouses.filter(singleWarehouse =>
			singleWarehouse.isWarehouseLinkedToResource(resource),
		);
	}
}
