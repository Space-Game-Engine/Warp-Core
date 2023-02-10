import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { NewHabitatInput } from "./input/NewHabitatInput";
import { HabitatModel } from "../database/model/habitat.model";
import { HabitatCreatedEvent } from "./event/habitat-created.event";
import { RegisterUserEvent } from "../auth/register/register-user.event";
import { HabitatRepository } from "../database/repository/habitat.repository";
import { PayloadDataService } from "../auth/payload-data.service";

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
