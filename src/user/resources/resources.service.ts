import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {
	HabitatModel,
	HabitatResourceCombined,
	HabitatResourceModel,
	HabitatResourceRepository,
} from '@warp-core/database';

@Injectable()
export class ResourcesService {
	constructor(
		private readonly habitatResourceRepository: HabitatResourceRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async getSingleResourceById(
		id: string,
	): Promise<HabitatResourceCombined | null> {
		const habitatResource = await this.habitatResourceRepository.findOneBy({
			habitatId: this.habitatModel.id,
			resourceId: id,
		});

		if (!habitatResource) {
			return null;
		}

		return this.prepareHabitatResourceMappedModel(habitatResource);
	}

	public async getAllResourcesForHabitat(
		habitatModelOrId: HabitatModel | number | null = null,
	): Promise<HabitatResourceCombined[]> {
		let habitatId: number;
		if (habitatModelOrId) {
			if (habitatModelOrId instanceof HabitatModel) {
				habitatId = habitatModelOrId.id;
			} else {
				habitatId = habitatModelOrId;
			}
		} else {
			habitatId = this.habitatModel.id;
		}

		const habitatResources = await this.habitatResourceRepository.findBy({
			habitatId,
		});

		const resources: HabitatResourceCombined[] = [];

		for (const singleHabitatResource of habitatResources) {
			resources.push(
				await this.prepareHabitatResourceMappedModel(singleHabitatResource),
			);
		}

		return resources;
	}

	private async prepareHabitatResourceMappedModel(
		singleHabitatResource: HabitatResourceModel,
	): Promise<HabitatResourceCombined> {
		const resourceModel = await singleHabitatResource.resource;
		const mappedResource = new HabitatResourceCombined(
			resourceModel,
			singleHabitatResource,
		);

		return mappedResource;
	}
}
