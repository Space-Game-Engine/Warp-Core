import { Injectable } from "@nestjs/common";
import { PayloadDataService } from "@warp-core/auth/payload-data.service";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ async: true })
@Injectable()
export class BuildingZoneExistsConstraint implements ValidatorConstraintInterface {
    constructor(
        protected readonly buildingZoneService: BuildingZoneService,
        protected readonly payloadDataService: PayloadDataService
    ) {}

    async validate(counterPerHabitat: number, args: ValidationArguments) {
        const currentHabitat = await this.payloadDataService.getModel() as HabitatModel;
        const buildingZone = await this.buildingZoneService
            .getSingleBuildingZone(
                counterPerHabitat,
                currentHabitat.id
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