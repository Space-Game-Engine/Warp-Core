import { Injectable } from "@nestjs/common";
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: true })
@Injectable()
export class IsBuildingIdProvidedConstraint implements ValidatorConstraintInterface {
    constructor(
        protected readonly buildingZoneService: BuildingZoneService
    ) {}

    async validate(buildingId: number, args: ValidationArguments) {
        //TODO handle not working validation
        return true;
        
        if (buildingId) {
            return true;
        }

        const addToQueue = args.object as AddToQueueInput;

        const buildingZone = await this.buildingZoneService.getSingleBuildingZone(
            addToQueue.counterPerHabitat
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