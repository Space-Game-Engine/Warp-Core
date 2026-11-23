import {
	Args,
	Int,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';

import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneService} from '@warp-core/user/building-zone/service/building-zone.service';
import {CalculateBuildingZoneCapabilitiesService} from '@warp-core/user/building-zone/service/calculate-building-zone-capabilities.service';

@Resolver(() => BuildingZoneModel)
export class BuildingZoneResolver {
	constructor(
		private readonly buildingZoneService: BuildingZoneService,
		private readonly calculateCapabilitiesService: CalculateBuildingZoneCapabilitiesService,
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
	public buildingBlueprintPlayer(
		@Parent() buildingZone: BuildingZoneModel,
	): Promise<BuildingBlueprintPlayerModel | null> {
		return buildingZone.getPlayerBlueprint();
	}

	@ResolveField()
	public building(
		@Parent() buildingZone: BuildingZoneModel,
	): Promise<BuildingBlueprintGlobalModel | null> {
		return buildingZone.getBuilding();
	}

	@ResolveField()
	public capabilities(
		@Parent() buildingZone: BuildingZoneModel,
	): Promise<CalculatedCapabilitiesModel | null> {
		return this.calculateCapabilitiesService.forBuildingZone(buildingZone);
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
