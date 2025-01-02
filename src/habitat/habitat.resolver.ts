import {Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {HabitatService} from './habitat.service';

import {
	BuildingQueueElementModel,
	BuildingQueueRepository,
	BuildingZoneModel,
	HabitatModel,
	HabitatResourceCombined,
} from '@warp-core/database';
import {ResourcesService} from '@warp-core/resources';

@Resolver(() => HabitatModel)
export class HabitatResolver {
	constructor(
		private readonly habitatService: HabitatService,
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly resourcesService: ResourcesService,
	) {}

	@Query(() => HabitatModel, {
		nullable: true,
		description: 'Get single habitat for logged in token',
		name: 'habitat_get',
	})
	public habitat(): Promise<HabitatModel> {
		return this.habitatService.getCurrentHabitat();
	}

	@Query(() => [HabitatModel], {
		nullable: true,
		description: 'Get all habitats for user logged in',
		name: 'habitat_getForUser',
	})
	public userHabitats(): Promise<HabitatModel[]> {
		return this.habitatService.getHabitatsForLoggedIn();
	}

	@ResolveField()
	public async buildingZones(
		@Parent() habitat: HabitatModel,
	): Promise<BuildingZoneModel[]> {
		return habitat.buildingZones;
	}

	@ResolveField()
	public buildingQueue(
		@Parent() habitat: HabitatModel,
	): Promise<BuildingQueueElementModel[]> {
		return this.buildingQueueRepository.getCurrentBuildingQueueForHabitat(
			habitat.id,
		);
	}

	@ResolveField(() => [HabitatResourceCombined])
	public habitatResources(
		@Parent() habitat: HabitatModel,
	): Promise<HabitatResourceCombined[]> {
		return this.resourcesService.getAllResourcesForHabitat(habitat);
	}
}
