import {Injectable} from '@nestjs/common';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {ResourceRepository} from '@warp-core/database/repository/resource.repository';
import {HabitatCreatedEvent} from '@warp-core/user/habitat';

@Injectable()
export class CreateResourcesPerHabitatService {
	constructor(
		private readonly resourceRepository: ResourceRepository,
		private readonly habitatResourceRepository: HabitatResourceRepository,
	) {}

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
