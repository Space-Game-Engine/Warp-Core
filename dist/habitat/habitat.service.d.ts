import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from "typeorm";
import { NewHabitatInput } from "./input/NewHabitatInput";
import { HabitatModel } from "./model/habitat.model";
export declare class HabitatService {
    private readonly habitatRepository;
    private readonly eventEmitter;
    constructor(habitatRepository: Repository<HabitatModel>, eventEmitter: EventEmitter2);
    getHabitatById(habitatId: number): Promise<HabitatModel | null>;
    getHabitatsByUserId(userId: number): Promise<HabitatModel[]>;
    createNewHabitat(newHabitatData: NewHabitatInput): Promise<HabitatModel>;
}
