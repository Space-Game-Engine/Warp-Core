import { PrismaClient, BuildingZone as PrismaBuildingZone } from "@prisma/client";
import { Inject, Service } from "typedi";
import { BuildingService } from "../building/BuildingService";
import { BuildingZone } from "./Models/BuildingZone";
import { BuildingZoneUserInputError } from "./BuildingZoneUserInputError";
import { ConstructBuildingInput } from "./InputTypes/ConstructBuildingInput";
import { Habitat } from "../habitat/Models/Habitat";
import CoreEventEmitter from "../core/CoreEventEmitter";

@Service()
export class BuildingZoneService {

    private buildingZonesByHabitatId: {[habitatId:number]: PrismaBuildingZone[]} = {};

    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient,
        @Inject("CONFIG") private readonly config: any,
        @Inject("CORE_EVENT_EMITTER") private readonly eventEmitter: CoreEventEmitter,
        private readonly buildingService: BuildingService
    ) {
    }

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

    async getAllBuildingZonesByHabitatId(habitatId: number): Promise<PrismaBuildingZone[]> {
        if (this.buildingZonesByHabitatId[habitatId]) {
            return this.buildingZonesByHabitatId[habitatId];
        }

        const buildingZones = await this.prisma.buildingZone.findMany({
            where: {
                habitatId: habitatId,
            }
        });

        this.eventEmitter.emit('buildingZone.after_fetch_list', buildingZones);

        return buildingZones;
    }

    getSingleBuildingZone(counterPerHabitat: number, habitatId: number): Promise<PrismaBuildingZone | null> {
        return this.prisma.buildingZone.findFirst({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        });
    }

    getSingleBuildingZoneById(buildingZoneId: number): Promise<PrismaBuildingZone | null> {
        return this.prisma.buildingZone.findUnique({
            where: {
                id: buildingZoneId
            }
        });
    }

    async createNewBuildingZone(habitatId: number): Promise<PrismaBuildingZone> {
        return this.prisma.buildingZone.create({
            data: {
                counterPerHabitat: await this.getMaxOfCounterPerHabitat(habitatId) + 1,
                habitatId: habitatId,
            }
        })
    }

    async destroyBuildingZone(counterPerHabitat: number, habitatId: number): Promise<PrismaBuildingZone> {
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
            throw new BuildingZoneUserInputError('Invalid building', { argumentName: 'constructBuilding' });
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
                level: BuildingZone.MINIMAL_BUILDING_LEVEL,
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

        if (newBuildingZoneLevel < BuildingZone.MINIMAL_BUILDING_LEVEL) {
            newBuildingZoneLevel = BuildingZone.MINIMAL_BUILDING_LEVEL;
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

    async createBuildingZoneOnNewHabitatCreation(newHabitat: Habitat) {
        for (let buildingZoneCounter = 0; buildingZoneCounter < this.config.habitat.buildingZones.counterForNewHabitat; buildingZoneCounter++) {
            await this.createNewBuildingZone(newHabitat.id);
        }
    }
}
