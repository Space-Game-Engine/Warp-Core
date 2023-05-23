import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { HabitatResourceModel } from "@warp-core/database/model/habitat-resource.model";
import { HabitatResourceRepository } from "@warp-core/database/repository/habitat-resource.repository";
import { ResourceRepository } from "@warp-core/database/repository/resource.repository";
import { HabitatCreatedEvent } from "@warp-core/habitat/event/habitat-created.event";

@Injectable()
export class CreateResourcesPerHabitat {

    constructor(
        private readonly resourceRepository: ResourceRepository,
        private readonly habitatResourceRepository: HabitatResourceRepository,
    ) { }

    @OnEvent('habitat.create_new')
    async createResourcesPerHabitat(newHabitatEvent: HabitatCreatedEvent): Promise<void> {
        const resourcesList = await this.resourceRepository.find();
        const habitatResourcesToSave = [];

        for (const singleResource of resourcesList) {
            const habitatResource = new HabitatResourceModel();
            habitatResource.habitat = newHabitatEvent.habitat;
            habitatResource.resource = singleResource;

            habitatResourcesToSave.push(habitatResource);
        }
        this.habitatResourceRepository.save(habitatResourcesToSave);
    }
}