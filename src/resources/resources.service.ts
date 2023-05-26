import { Injectable } from "@nestjs/common";
import { AuthorizedHabitatModel } from "@warp-core/auth";
import { HabitatModel, HabitatResourceCombined, HabitatResourceModel, HabitatResourceRepository, ResourceRepository } from "@warp-core/database";

@Injectable()
export class ResourcesService {

    constructor(
        private readonly resourceRepository: ResourceRepository,
        private readonly habitatResourceRepository: HabitatResourceRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
    ) { }

    async getSingleResourceById(id: string): Promise<HabitatResourceCombined> {
        const habitatResource = await this.habitatResourceRepository.findOneBy({
            habitatId: this.habitatModel.id,
            resourceId: id,
        });

        return this.prepareHabitatResourceMappedModel(habitatResource);
    }

    async getAllResourcesForHabitat(habitatModel: HabitatModel = null): Promise<HabitatResourceCombined[]> {
        const habitatResources = await this.habitatResourceRepository.findBy({
            habitatId: (habitatModel ?? this.habitatModel).id,
        });

        const resources: HabitatResourceCombined[] = [];

        for (const singleHabitatResource of habitatResources) {
            resources.push(await this.prepareHabitatResourceMappedModel(singleHabitatResource));
        }

        return resources;
    }

    private async prepareHabitatResourceMappedModel(singleHabitatResource: HabitatResourceModel): Promise<HabitatResourceCombined> {
        const resourceModel = await singleHabitatResource.resource;
        const mappedResource = new HabitatResourceCombined(resourceModel, singleHabitatResource);

        return mappedResource;
    }
}