import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {ResourceRepository} from '@warp-core/database/repository/resource.repository';
import {HabitatCreatedEvent} from '@warp-core/user/habitat';

@Injectable()
export class CreateResourcesPerHabitat {
	constructor(
		private readonly resourceRepository: ResourceRepository,
		private readonly habitatResourceRepository: HabitatResourceRepository,
	) {}

	@OnEvent('habitat.created.after_save')
	public async createResourcesPerHabitat(
		newHabitatEvent: HabitatCreatedEvent,
	): Promise<void> {
		const resourcesList = await this.resourceRepository.find();
		const habitatResourcesToSave: HabitatResourceModel[] = [];

		for (const singleResource of resourcesList) {
			const habitatResource = new HabitatResourceModel();
			habitatResource.habitat = newHabitatEvent.habitat;
			habitatResource.resource = singleResource;

			habitatResourcesToSave.push(habitatResource);
		}

		if (habitatResourcesToSave.length > 0) {
			await this.habitatResourceRepository.insert(habitatResourcesToSave);
		}
	}
}
