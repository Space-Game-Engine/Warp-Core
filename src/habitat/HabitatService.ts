import { Service, Inject } from "typedi";
import { PrismaClient } from "@prisma/client";
import { NewHabitatInput } from "./NewHabitatInput";

@Service()
export class HabitatService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient
    ) { }

    async getHabitatById(habitatId: number) {
        return await this.prisma.habitat.findFirst({
            where: {
                id: habitatId
            }
        });
    }

    async getHabitatsByUserId(userId: number) {
        return await this.prisma.habitat.findMany({
            where: {
                userId: userId
            }
        });
    }

    async createNewHabitat(newHabitatData: NewHabitatInput) {
        const newHabitat = await this.prisma.habitat.create({
            data: {
                userId: newHabitatData.userId,
                name: newHabitatData.name,
                isMain: newHabitatData.isMain,
            }
        });

        return newHabitat;
    }
}