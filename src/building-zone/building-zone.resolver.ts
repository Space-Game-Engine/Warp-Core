import {
	Args,
	Int,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';

import {BuildingZoneService} from '@warp-core/building-zone/building-zone.service';
import {
	BuildingModel,
	BuildingQueueElementModel,
	BuildingQueueRepository,
	BuildingZoneModel,
	HabitatModel,
} from '@warp-core/database';

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
