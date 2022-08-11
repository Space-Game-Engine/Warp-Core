import { Inject, Service } from "typedi";
import { PrismaClient } from "@prisma/client";
import { BuildingInput } from "./InputTypes/BuildingInput";

@Service()
export class BuildingService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient
    ) {
    }

    async getBuildingById(buildingId: number) {
        return await this.prisma.building.findFirst({
            where: {
                id: buildingId,
            },
            include: {
                buildingDetailsAtCertainLevel: {
                    orderBy: {
                        level: "asc"
                    }
                },
            }
        });
    }

    async getAllBuildings() {
        return await this.prisma.building.findMany();
    }

    async createNewBuilding(buildingInput: BuildingInput) {
        const newBuilding = await this.prisma.building.create({
            data: buildingInput
        });

        return newBuilding;
    }

    async editBuilding(buildingId: number, buildingInput: BuildingInput) {
        const updatedBuilding = await this.prisma.building.update({
            where: {
                id: buildingId,
            },
            data: buildingInput
        });

        return updatedBuilding;
    }

    async calculateTimeInSecondsToUpgradeBuilding(startLevel: number, endLevel: number, buildingId: number): Promise<number> {
        const building = await this.getBuildingById(buildingId);

        if (!building) {
            throw new Error("Building does not exists");
        }

        let secondsToUpgrade = 0;

        if (startLevel === endLevel) {
            return secondsToUpgrade;
        }

        for (const buildingDetails of building.buildingDetailsAtCertainLevel) {
            if (buildingDetails.level <= startLevel) {
                continue;
            }

            if (buildingDetails.level > endLevel) {
                break;
            }

            secondsToUpgrade += buildingDetails.timeToUpdateBuildingInSeconds;
        }

        return secondsToUpgrade;
    }
}
