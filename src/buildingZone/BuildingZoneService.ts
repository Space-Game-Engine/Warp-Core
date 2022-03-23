import { PrismaClient } from "@prisma/client";
import { Inject, Service } from "typedi";

@Service()
export class BuildingZoneService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient
    ) { }

    countBuildingZonesOnHabitatByHabitatId(habitatId: number) {
        return this.prisma.buildingZone.count({
            where: {
                habitatId: habitatId,
            }
        });
    }

    getSingleBuildingZone(counterPerHabitat: number, habitatId: number) {
        return this.prisma.buildingZone.findFirst({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        });
    }

    async createNewBuildingZone(habitatId: number) {
        return this.prisma.buildingZone.create({
            data: {
                counterPerHabitat: await this.countBuildingZonesOnHabitatByHabitatId(habitatId) + 1,
                habitatId: habitatId,
            }
        })
    }

    async getHabitat(id: number) {
        const singleBuildingZone = await this.prisma.buildingZone.findFirst({
            where: {
                id: id,
            },
            include: {
                habitat: true,
            }
        });

        return singleBuildingZone?.habitat;
    }
}