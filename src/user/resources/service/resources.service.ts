import {Injectable} from '@nestjs/common';

import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {CalculationMechanic} from '@warp-core/user/resources/service/calculate/resource-calculation/calculation-mechanic.interface';

@Injectable()
export class ResourcesService {
	constructor(
		private readonly habitatResourceRepository: HabitatResourceRepository,
		private readonly calculationMechanic: CalculationMechanic,
	) {}

	public async getProductionRateForResource(
		habitatResource: HabitatResourceCombined,
	): Promise<number> {
		const resource = await this.getHabitatResource(
			habitatResource.habitatId,
			habitatResource.id,
		);

		if (!resource) {
			return 0;
		}

		return this.calculationMechanic.getProductionRate(resource);
	}

	public async getSingleResourceById(
		habitatId: number,
		resourceId: string,
	): Promise<HabitatResourceCombined | null> {
		const habitatResource = await this.getHabitatResource(
			habitatId,
			resourceId,
		);

		if (!habitatResource) {
			return null;
		}

		return this.prepareHabitatResourceMappedModel(habitatResource);
	}

	public async getAllResourcesForHabitat(
		habitatId: number,
	): Promise<HabitatResourceCombined[]> {
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

	private getHabitatResource(
		habitatId: number,
		resourceId: string,
	): Promise<HabitatResourceModel | null> {
		return this.habitatResourceRepository.findOneBy({
			habitatId,
			resourceId,
		});
	}
}
