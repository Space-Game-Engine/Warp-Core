import {Inject, Service} from "typedi";
import {PrismaClient} from "@prisma/client";
import {NewHabitatInput} from "./NewHabitatInput";
import {BuildingZoneService} from "../buildingZone/BuildingZoneService";

@Service()
export class HabitatService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient,
        private readonly buildingZoneService: BuildingZoneService
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


    }
}
