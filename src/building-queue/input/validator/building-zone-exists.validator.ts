import { Injectable } from "@nestjs/common";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: true })
@Injectable()
export class BuildingZoneExistsConstraint implements ValidatorConstraintInterface {
    constructor(
        protected readonly buildingZoneService: BuildingZoneService
    ) {}

    async validate(counterPerHabitat: number, args: ValidationArguments) {
        //TODO handle not working validation
        return true;

        const buildingZone = await this.buildingZoneService
            .getSingleBuildingZone(
                counterPerHabitat
            );

        if (!buildingZone) {
            return false;
        }
        
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `Building zone for provided id not exists`;
    }
}

export function BuildingZoneExists(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: BuildingZoneExistsConstraint,
        });
    };
}