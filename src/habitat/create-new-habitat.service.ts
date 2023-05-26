import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { RegisterUserEvent } from "@warp-core/auth";
import { HabitatModel, HabitatRepository } from "@warp-core/database";
import { HabitatCreatedEvent } from "@warp-core/habitat/event/habitat-created.event";
import { NewHabitatInput } from "@warp-core/habitat/input/NewHabitatInput";

@Injectable()
export class CreateNewHabitatService {

    constructor(
        private readonly habitatRepository: HabitatRepository,
        private readonly eventEmitter: EventEmitter2
    ) {
    }

    @OnEvent('user.create_new')
    async createHabitatOnUserRegistration(payload: RegisterUserEvent) {
        const currentHabitats = await this.habitatRepository.getHabitatsByUserId(payload.getUserId());

        if (currentHabitats.length > 0) {
            payload.setHabitatId(currentHabitats.find(e => true).id);

            return;
        }

        const newHabitat = await this.createNewHabitat({
            userId: payload.getUserId(),
            isMain: true,
            name: 'New habitat'
        });

        payload.setHabitatId(newHabitat.id);
    }

    async createNewHabitat(newHabitatData: NewHabitatInput): Promise<HabitatModel> {
        const newHabitat = await this.habitatRepository.save(newHabitatData);

        await this.eventEmitter.emitAsync('habitat.create_new', new HabitatCreatedEvent(newHabitat));

        return newHabitat;
    }
}