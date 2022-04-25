import { PrismaClient } from "@prisma/client";
import { Inject, Service } from "typedi";
import { BuildingService } from "../building/BuildingService";
import { BuildingZone } from "./BuildingZone";
import { BuildingZoneUserInputError } from "./BuildingZoneUserInputError";
import { ConstructBuildingInput } from "./InputTypes/ConstructBuildingInput";

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

    async destroyBuildingZone(counterPerHabitat: number, habitatId: number) {
        const buildingZone = await this.getSingleBuildingZone(counterPerHabitat, habitatId);

        return this.prisma.buildingZone.delete({
            where: {
                id: buildingZone?.id
            }
        });
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
                level: BuildingZone.MINIMAL_LEVEL_WITH_BUILDING,
            }
        });
    }

    async upgradeBuildingZone(counterPerHabitat: number, habitatId: number, numberOfLevelsToUpgrade: number = 1) {
        const singleBuildingZone = await this.getSingleBuildingZone(counterPerHabitat, habitatId);

        if (!singleBuildingZone) {
            throw new BuildingZoneUserInputError('Invalid building zone', { argumentName: ['counterPerHabitat', 'habitatId'] });
        }

        if (!singleBuildingZone.buildingId) {
            throw new BuildingZoneUserInputError('Building zone is not connected to any building', { argumentName: ['counterPerHabitat', 'habitatId'] });
        }

        let newBuildingZoneLevel = singleBuildingZone.level + numberOfLevelsToUpgrade;

        return this.prisma.buildingZone.update({
            where: {
                id: singleBuildingZone.id
            },
            data: {
                level: newBuildingZoneLevel,
            }
        });
    }

    async downgradeBuildingZone(counterPerHabitat: number, habitatId: number, numberOfLevelsToDowngrade: number = 1) {
        const singleBuildingZone = await this.getSingleBuildingZone(counterPerHabitat, habitatId);

        if (!singleBuildingZone) {
            throw new BuildingZoneUserInputError('Invalid building zone', { argumentName: ['counterPerHabitat', 'habitatId'] });
        }

        if (!singleBuildingZone.buildingId) {
            throw new BuildingZoneUserInputError('Building zone is not connected to any building', { argumentName: ['counterPerHabitat', 'habitatId'] });
        }

        let newBuildingZoneLevel = singleBuildingZone.level - numberOfLevelsToDowngrade;

        if (newBuildingZoneLevel < BuildingZone.MINIMAL_LEVEL_WITH_BUILDING) {
            newBuildingZoneLevel = BuildingZone.MINIMAL_LEVEL_WITH_BUILDING;
        }

        return this.prisma.buildingZone.update({
            where: {
                id: singleBuildingZone.id
            },
            data: {
                level: newBuildingZoneLevel,
            }
        });
    }
}
