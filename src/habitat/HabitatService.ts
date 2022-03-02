import { Service, Inject } from "typedi";
import { PrismaClient } from "@prisma/client";

@Service()
export class HabitatService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient
    ) {}

    async getHabitatById(habitatId: number) {
        return await this.prisma.habitat.findFirst({where: {
            id: habitatId
        }});
    }
}