import { Injectable } from "@nestjs/common";
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraintInterface } from "class-validator";

@Injectable()
export class EndLevelIsNotLowerThanBuildingZoneConstraint implements ValidatorConstraintInterface {

    constructor(
        private readonly buildingZoneService: BuildingZoneService,
    ) { }

    async validate(endLevel: number, args: ValidationArguments){
        const addToQueue = args.object as AddToQueueInput;

        const buildingZone = await this.buildingZoneService.getSingleBuildingZone(
            addToQueue.counterPerHabitat
        );

        if (!buildingZone) {
            return false;
        }

        if (endLevel <= buildingZone.level) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `End level should not be lower than existing zone level`;
    }
}

export function EndLevelIsNotLowerThanBuildingZone(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: EndLevelIsNotLowerThanBuildingZoneConstraint,
        });
    };
}
