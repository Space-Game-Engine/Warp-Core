import { Service, Inject } from "typedi";
import { Prisma, PrismaClient } from "@prisma/client";
import { NewHabitatInput } from "./NewHabitatInput";

@Service()
export class HabitatService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient
    ) { }

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

    createNewHabitat(newHabitatData: NewHabitatInput) {
        return this.prisma.habitat.create({
            data: newHabitatData
        });
    }

    async getAllBuildingZonesForSingleHabitat(habitatId: number) {
        const habitat = await this.prisma.habitat.findFirst({
            where: {
                id: habitatId
            },
            include: { buildingZones: true }
        });
        return habitat?.buildingZones;
    }
}