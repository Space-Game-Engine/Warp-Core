import { PrismaClient } from "@prisma/client";
import { Inject, Service } from "typedi";
import { BuildingService } from "../building/BuildingService";
import { BuildingZoneUserInputError } from "./BuildingZoneUserInputError";
import { ConstructBuildingInput } from "./ConstructBuildingInput";

@Service()
export class BuildingZoneService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient,
        private readonly buildingService: BuildingService
    ) { }

    countBuildingZonesOnHabitatByHabitatId(habitatId: number) {
        return this.prisma.buildingZone.count({
            where: {
                habitatId: habitatId,
            }
        });
    }

    async getMaxOfCounterPerHabitat(habitatId: number): Promise<number> {
        const allBuildingZones = await this.getAllBuildingZonesByHabitatId(habitatId);
        let maxCounterValue = 0;

        for (const singleBuildingZone of allBuildingZones) {
            if (singleBuildingZone.counterPerHabitat > maxCounterValue) {
                maxCounterValue = singleBuildingZone.counterPerHabitat;
            }
        }

        return maxCounterValue;
    }

    getAllBuildingZonesByHabitatId(habitatId: number) {
        return this.prisma.buildingZone.findMany({
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
                counterPerHabitat: await this.getMaxOfCounterPerHabitat(habitatId) + 1,
                habitatId: habitatId,
            }
        })
    }

    async constructBuildingOnBuildingZone(counterPerHabitat: number, habitatId: number, constructBuilding: ConstructBuildingInput) {
        const building = await this.buildingService.getBuildingById(constructBuilding.buildingId);

        if (!building) {
            throw new BuildingZoneUserInputError('Invalid building', { argumentName: 'constructBuilding'});
        }

        const singleBuildingZone = await this.getSingleBuildingZone(counterPerHabitat, habitatId);

        if (!singleBuildingZone) {
            throw new BuildingZoneUserInputError('Invalid building zone', { argumentName: ['counterPerHabitat', 'habitatId'] });
        }

        if (singleBuildingZone.buildingId) {
            throw new BuildingZoneUserInputError('Building zone already has building');
        }

        return this.prisma.buildingZone.update({
            where: {
                id: singleBuildingZone.id
            },
            data: {
                buildingId: building.id,
                level: 1,
            }
        });
    }
}
