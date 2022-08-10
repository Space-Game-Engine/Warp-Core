import { Inject, Service } from "typedi";
import { BuildingZone, PrismaClient } from "@prisma/client";

@Service()
export class BuildingQueueFetchService {

    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient,
    ) {
    }

    getCurrentBuildingQueueForHabitat(habitatId: number) {
        return this.prisma.buildingQueueElement.findMany({
            where: {
                buildingZone: {
                    habitatId: habitatId
                },
                endTime: {
                    gte: new Date()
                }
            }
        });
    }

    getCurrentBuildingQueueForBuildingZone(buildingZone: BuildingZone) {
        return this.prisma.buildingQueueElement.findMany({
            where: {
                buildingZone: buildingZone,
                endTime: {
                    gte: new Date()
                }
            }
        });
    }

    getSingleBuildingQueueElementById(queueElementId: number) {
        return this.prisma.buildingQueueElement.findUnique({
            where: {
                id: queueElementId
            }
        });
    }

    countActiveBuildingQueueElementsForHabitat(habitatId: number) {
        return this.prisma.buildingQueueElement.count({
            where: {
                buildingZone: {
                    habitatId: habitatId
                },
                endTime: {
                    gte: new Date()
                }
            }
        })
    }
}