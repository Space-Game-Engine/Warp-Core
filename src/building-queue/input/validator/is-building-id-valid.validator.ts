import { Injectable } from "@nestjs/common";
import { BuildingService } from "@warp-core/building/building.service";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: true })
@Injectable()
export class IsBuildingIdValidConstraint implements ValidatorConstraintInterface {
    constructor(
        protected readonly buildingService: BuildingService
    ) {}

    async validate(buildingId: number, args: ValidationArguments) {
        if (!buildingId) {
            return true;
        }

        const building = await this.buildingService.getBuildingById(buildingId);

        if (!building) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `Selected building not exists`;
    }
}

export function IsBuildingIdValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsBuildingIdValidConstraint,
        });
    };
}