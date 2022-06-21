import {Inject, Service} from "typedi";
import {PrismaClient} from "@prisma/client";

@Service()
export class BuildingQueueService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient
    ) {
    }

    getBuildingQueueForHabitat(habitatId: number) {
        return this.prisma.buildingQueueElement.findMany({
            where: {
                buildingZone: {
                    habitatId: habitatId
                }
            }
        });
    }
}
