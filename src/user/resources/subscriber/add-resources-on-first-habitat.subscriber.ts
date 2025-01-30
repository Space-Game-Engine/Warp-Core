import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {HabitatCreatedEvent} from '@warp-core/user/habitat';

@Injectable()
export class AddResourcesOnFirstHabitatSubscriber {
	constructor(
		private readonly runtimeConfig: RuntimeConfig,
		private readonly habitatResourceRepository: HabitatResourceRepository,
	) {}

	@OnEvent('habitat.created.after_registration')
	public async addResourcesToHabitat(
		newHabitatEvent: HabitatCreatedEvent,
	): Promise<void> {
		if (
			!this.runtimeConfig.habitat.onStart.resources ||
			this.runtimeConfig.habitat.onStart.resources.length === 0
		) {
			return;
		}

		const habitatModel = newHabitatEvent.habitat;
		const resourcesOnStart = this.runtimeConfig.habitat.onStart.resources;
		const habitatResourcesOnStart =
			await this.habitatResourceRepository.getHabitatResourcesByIds(
				resourcesOnStart.map(singleResourceOnStart => singleResourceOnStart.id),
				habitatModel.id,
			);

		for (const singleResourceOnStart of resourcesOnStart) {
			const habitatResource = habitatResourcesOnStart.find(
				habitatResourceToCheck =>
					habitatResourceToCheck.resourceId === singleResourceOnStart.id,
			) as HabitatResourceModel;

			habitatResource.currentAmount = singleResourceOnStart.amount;

			await this.habitatResourceRepository.update(habitatResource.id, {
				currentAmount: habitatResource.currentAmount,
			});
		}
	}
}
