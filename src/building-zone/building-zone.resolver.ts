import {
	Args,
	Int,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import {BuildingZoneService} from '@warp-core/building-zone/building-zone.service';
import {BuildingQueueRepository, BuildingZoneModel} from '@warp-core/database';

@Resolver(of => BuildingZoneModel)
export class BuildingZoneResolver {
	constructor(
		private readonly buildingZoneService: BuildingZoneService,
		private readonly buildingQueueRepository: BuildingQueueRepository,
	) {}

	@Query(returns => BuildingZoneModel, {
		nullable: true,
		description: 'Returns single building zone',
		name: 'buildingZone_get',
	})
	buildingZone(
		@Args('localBuildingZoneId', {type: () => Int})
		localBuildingZoneId: number,
	) {
		return this.buildingZoneService.getSingleBuildingZone(localBuildingZoneId);
	}

	@Query(returns => [BuildingZoneModel], {
		nullable: true,
		description: 'Returns all building zones for single habitat',
		name: 'buildingZone_getAll',
	})
	allBuildingZones() {
		return this.buildingZoneService.getAllZonesForCurrentHabitat();
	}

	@ResolveField()
	habitat(@Parent() buildingZone: BuildingZoneModel) {
		return buildingZone.habitat;
	}

	@ResolveField()
	building(@Parent() buildingZone: BuildingZoneModel) {
		return buildingZone.building;
	}

	@ResolveField()
	buildingQueue(@Parent() buildingZone: BuildingZoneModel) {
		return this.buildingQueueRepository.getCurrentBuildingQueueForBuildingZone(
			buildingZone,
		);
	}
}
