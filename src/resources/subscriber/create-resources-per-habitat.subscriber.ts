import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { HabitatResourceModel, HabitatResourceRepository, ResourceRepository } from "@warp-core/database";
import { HabitatCreatedEvent } from "@warp-core/habitat";

@Injectable()
export class CreateResourcesPerHabitat {

    constructor(
        private readonly resourceRepository: ResourceRepository,
        private readonly habitatResourceRepository: HabitatResourceRepository,
    ) { }

    @OnEvent('habitat.created.after_save')
    async createResourcesPerHabitat(newHabitatEvent: HabitatCreatedEvent, transactionId: string): Promise<void> {
        const resourcesList = await this.resourceRepository.find();
        const habitatResourcesToSave = [];

        for (const singleResource of resourcesList) {
            const habitatResource = new HabitatResourceModel();
            habitatResource.habitat = newHabitatEvent.habitat;
            habitatResource.resource = singleResource;

            habitatResourcesToSave.push(habitatResource);
        }


        if (habitatResourcesToSave.length > 0) {
            const entityManager = this.habitatResourceRepository.getSharedTransaction(transactionId);
            await entityManager.insert(HabitatResourceModel, habitatResourcesToSave);
        }
    }
}