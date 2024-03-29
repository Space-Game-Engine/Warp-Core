import {Injectable} from '@nestjs/common';
import {HabitatCreatedEvent} from '@warp-core/habitat';
import {OnEvent} from '@nestjs/event-emitter';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {
	HabitatResourceModel,
	HabitatResourceRepository,
} from '@warp-core/database';

@Injectable()
export class AddResourcesOnFirstHabitatSubscriber {
	constructor(
		private readonly runtimeConfig: RuntimeConfig,
		private readonly habitatResourceRepository: HabitatResourceRepository,
	) {}

	@OnEvent('habitat.created.after_registration')
	async addResourcesToHabitat(
		newHabitatEvent: HabitatCreatedEvent,
	) {
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
