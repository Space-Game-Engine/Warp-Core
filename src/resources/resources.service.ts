import { Injectable } from "@nestjs/common";
import { AuthorizedHabitatModel } from "@warp-core/auth/payload/model/habitat.model";
import { HabitatResourceCombined } from "@warp-core/database/model/habitat-resource.mapped.model";
import { HabitatResourceModel } from "@warp-core/database/model/habitat-resource.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { HabitatResourceRepository } from "@warp-core/database/repository/habitat-resource.repository";
import { ResourceRepository } from "@warp-core/database/repository/resource.repository";

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
        const mappedResource = new HabitatResourceCombined();
        mappedResource.baseMaxCapacity = resourceModel.baseMaxCapacity;
        mappedResource.currentAmount = singleHabitatResource.currentAmount;
        mappedResource.habitatId = singleHabitatResource.habitatId;
        mappedResource.id = resourceModel.id;
        mappedResource.name = resourceModel.name;
        mappedResource.type = resourceModel.type;

        return mappedResource;
    }
}