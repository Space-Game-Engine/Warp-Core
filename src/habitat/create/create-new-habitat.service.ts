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
        const [transactionId] = await this.habitatRepository.createSharedTransaction();

        try {
            const newHabitat = await this.createNewHabitat({
                userId: payload.getUserId(),
                isMain: true,
                name: 'New habitat'
            }, transactionId);

            payload.setHabitatId(newHabitat.id);

            await this.eventEmitter.emitAsync('habitat.created.after_registration', new HabitatCreatedEvent(newHabitat), transactionId);

            await this.habitatRepository.commitSharedTransaction(transactionId);
        } catch (e) {
            await this.habitatRepository.rollbackSharedTransaction(transactionId);

            throw e;
        }

    }

    async createNewHabitat(newHabitatData: NewHabitatInput, transactionId: string | null = null): Promise<HabitatModel> {
        let entityManager = this.habitatRepository.manager;

        if (transactionId != null) {
            entityManager = this.habitatRepository.getSharedTransaction(transactionId);
        }

        const newHabitat = entityManager.create<HabitatModel>(HabitatModel, newHabitatData);
        await entityManager.save(newHabitat);

        await this.eventEmitter.emitAsync('habitat.created.after_save', new HabitatCreatedEvent(newHabitat), transactionId);

        return newHabitat;
    }
}