import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PayloadDataService } from "@warp-core/auth/payload-data.service";
import { RegisterUserEvent } from "@warp-core/auth/register/register-user.event";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { HabitatRepository } from "@warp-core/database/repository/habitat.repository";
import { HabitatCreatedEvent } from "@warp-core/habitat/event/habitat-created.event";
import { NewHabitatInput } from "@warp-core/habitat/input/NewHabitatInput";

@Injectable()
export class HabitatService {
    constructor(
        private readonly habitatRepository: HabitatRepository,
        private readonly payloadDataService: PayloadDataService,
        private readonly eventEmitter: EventEmitter2
    ) {
    }

    async getCurrentHabitat(): Promise<HabitatModel> {
        const model = await this.payloadDataService.getModel();

        return this.habitatRepository.getHabitatById(model.getAuthId());
    }

    async getHabitatsForLoggedIn(): Promise<HabitatModel[]> {
        const userId = this.payloadDataService.getUserId();

        return this.habitatRepository.getHabitatsByUserId(userId);
    }

    async createNewHabitat(newHabitatData: NewHabitatInput): Promise<HabitatModel> {
        const newHabitat = await this.habitatRepository.save(newHabitatData);

        await this.eventEmitter.emitAsync('habitat.create_new', new HabitatCreatedEvent(newHabitat));

        return newHabitat;
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
}
