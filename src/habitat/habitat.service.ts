import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from "typeorm";
import { NewHabitatInput } from "./input/NewHabitatInput";
import { HabitatModel } from "./model/habitat.model";
import { HabitatCreatedEvent } from "./event/habitat-created.event";

@Injectable()
export class HabitatService {
    constructor(
        @InjectRepository(HabitatModel)
        private readonly habitatRepository: Repository<HabitatModel>,
        private readonly eventEmitter: EventEmitter2
    ) {
    }

    getHabitatById(habitatId: number): Promise<HabitatModel|null> {
        return this.habitatRepository.findOne({
            where: {
                id: habitatId
            },
            loadEagerRelations: false,
        });
    }

    getHabitatsByUserId(userId: number): Promise<HabitatModel[]> {
        return this.habitatRepository.find({
            where: {
                userId: userId
            },
            loadEagerRelations: false
        });
    }

    async createNewHabitat(newHabitatData: NewHabitatInput): Promise<HabitatModel>  {
        const newHabitat = await this.habitatRepository.save(newHabitatData);

        await this.eventEmitter.emitAsync('habitat.create_new', new HabitatCreatedEvent(newHabitat));

        return newHabitat;
    }
}
