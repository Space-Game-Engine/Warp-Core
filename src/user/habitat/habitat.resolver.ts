import {Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {HabitatService} from './habitat.service';

import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {ResourcesQueryEmitter} from '@warp-core/user/resources';

@Resolver(() => HabitatModel)
export class HabitatResolver {
	constructor(
		private readonly habitatService: HabitatService,
		private readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly resourcesService: ResourcesQueryEmitter,
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
	public async habitatResources(
		@Parent() habitat: HabitatModel,
	): Promise<HabitatResourceCombined[]> {
		const {data, error} = await this.resourcesService.getResourcesPerHabitat(
			habitat.id,
		);

		if (error) {
			throw new InternalEmitterError(error.message);
		}

		return data!;
	}
}
