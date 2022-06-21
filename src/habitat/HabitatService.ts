import {Inject, Service} from "typedi";
import {PrismaClient} from "@prisma/client";
import {NewHabitatInput} from "./InputTypes/NewHabitatInput";
import CoreEventEmitter from "../CoreEventEmitter";

@Service()
export class HabitatService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient,
        @Inject("CORE_EVENT_EMITTER") private readonly eventEmitter: CoreEventEmitter
    ) {
    }

    getHabitatById(habitatId: number) {
        return this.prisma.habitat.findFirst({
            where: {
                id: habitatId
            }
        });
    }

    getHabitatsByUserId(userId: number) {
        return this.prisma.habitat.findMany({
            where: {
                userId: userId
            }
        });
    }

    async createNewHabitat(newHabitatData: NewHabitatInput) {
        const newHabitat = await this.prisma.habitat.create({
            data: newHabitatData
        });

        this.eventEmitter.emit('habitat.create_new', newHabitat);

        return newHabitat;
    }
}
