import { Injectable } from "@nestjs/common";
import { PayloadDataService } from "@warp-core/auth/payload-data.service";
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: true })
@Injectable()
export class IsBuildingIdProvidedConstraint implements ValidatorConstraintInterface {
    constructor(
        protected readonly buildingZoneService: BuildingZoneService,
        protected readonly payloadDataService: PayloadDataService
    ) {}

    async validate(buildingId: number, args: ValidationArguments) {
        if (buildingId) {
            return true;
        }

        const addToQueue = args.object as AddToQueueInput;
        const currentHabitat = await this.payloadDataService.getModel() as HabitatModel;

        const buildingZone = await this.buildingZoneService.getSingleBuildingZone(
            addToQueue.counterPerHabitat,
            currentHabitat.id
        );

        if (!buildingZone.buildingId) {
            return false;
        } 
        
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `Building Id is required to create new building on existing building zone`;
    }
}

export function IsBuildingIdProvided(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsBuildingIdProvidedConstraint,
        });
    };
}