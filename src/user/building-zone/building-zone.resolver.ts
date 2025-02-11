import {
	Args,
	Int,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';

import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneService} from '@warp-core/user/building-zone/building-zone.service';

@Resolver(() => BuildingZoneModel)
export class BuildingZoneResolver {
	constructor(
		private readonly buildingZoneService: BuildingZoneService,
		private readonly buildingQueueRepository: BuildingQueueRepository,
	) {}

	@Query(() => BuildingZoneModel, {
		nullable: true,
		description: 'Returns single building zone',
		name: 'buildingZone_get',
	})
	public buildingZone(
		@Args('localBuildingZoneId', {type: () => Int})
		localBuildingZoneId: number,
	): Promise<BuildingZoneModel | null> {
		return this.buildingZoneService.getSingleBuildingZone(localBuildingZoneId);
	}

	@Query(() => [BuildingZoneModel], {
		nullable: true,
		description: 'Returns all building zones for single habitat',
		name: 'buildingZone_getAll',
	})
	public allBuildingZones(): Promise<BuildingZoneModel[]> {
		return this.buildingZoneService.getAllZonesForCurrentHabitat();
	}

	@ResolveField()
	public async habitat(
		@Parent() buildingZone: BuildingZoneModel,
	): Promise<HabitatModel> {
		return buildingZone.habitat;
	}

	@ResolveField()
	public async building(
		@Parent() buildingZone: BuildingZoneModel,
	): Promise<BuildingModel | undefined> {
		return buildingZone.building;
	}

	@ResolveField()
	public buildingQueue(
		@Parent() buildingZone: BuildingZoneModel,
	): Promise<BuildingQueueElementModel[]> {
		return this.buildingQueueRepository.getCurrentBuildingQueueForBuildingZone(
			buildingZone,
		);
	}
}
