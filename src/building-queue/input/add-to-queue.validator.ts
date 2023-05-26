import { Injectable, BadRequestException } from '@nestjs/common';
import { AddToQueueInput } from '@warp-core/building-queue/input/add-to-queue.input';
import { BuildingZoneService } from '@warp-core/building-zone';
import { BuildingService } from "@warp-core/building";
import { CustomValidator } from '@warp-core/core';
import { BuildingModel, BuildingZoneModel } from '@warp-core/database';

@Injectable()
export class AddToQueueValidator extends CustomValidator<AddToQueueInput> {
    constructor(
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingService: BuildingService,
    ) {
        super();
    }

    protected async customValidator(addToQueue: AddToQueueInput): Promise<boolean> {
        const buildingZone = await this.getBuildingZone(addToQueue);
        const building = await this.getBuilding(addToQueue, buildingZone);
        await this.validateEndLevel(addToQueue, buildingZone, building);

        return true;
    }

    private async getBuildingZone(addToQueue: AddToQueueInput): Promise<BuildingZoneModel> {
        const buildingZone = await this.buildingZoneService
            .getSingleBuildingZone(
                addToQueue.localBuildingZoneId
            );

        if (!buildingZone) {
            throw new BadRequestException('Provided building zone does not exist.');
        }

        return buildingZone;
    }

    private async getBuilding(addToQueue: AddToQueueInput, buildingZone: BuildingZoneModel): Promise<BuildingModel> {
        const buildingFromBuildingZone = await buildingZone.building;
        if (buildingFromBuildingZone) {
            return buildingFromBuildingZone;
        }

        if (!addToQueue.buildingId) {
            throw new BadRequestException('Building Id is required when current building zone does not have any building.');
        }

        const building = await this.buildingService.getBuildingById(addToQueue.buildingId);

        if (!building) {
            throw new BadRequestException('Provided building does not exist.');
        }

        return building;
    }

    private async validateEndLevel(addToQueue: AddToQueueInput, buildingZone: BuildingZoneModel, building: BuildingModel) {
        if (addToQueue.endLevel < buildingZone.level) {
            throw new BadRequestException('End level should not be lower than existing level.');
        }

        const lastPossibleUpdate = (await building.buildingDetailsAtCertainLevel).at(-1);

        if (addToQueue.endLevel > lastPossibleUpdate.level) {
            throw new BadRequestException('You cannot update higher than it is possible. Check Building details.');
        }
    }
}