import { Service, Inject } from "typedi";
import { PrismaClient } from "@prisma/client";
import { BuildingInput } from "./BuildingInput";

@Service()
export class BuildingService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient
    ) { }

    async getBuildingById(buildingId: number) {
        return await this.prisma.building.findFirst({
            where: {
                id: buildingId,
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
}