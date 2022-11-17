import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { Repository } from "typeorm";
import { BuildingModel } from "../../building/model/building.model";

export class BuildingInstallService {

    constructor(
        @InjectRepository(BuildingModel)
        private buildingRepository: Repository<BuildingModel>,
    ) { }

    async install(arrayToInstall: any) {
        for (const key in arrayToInstall) {
            if (Object.prototype.hasOwnProperty.call(arrayToInstall, key) === false) {
                continue;
            }
            const buildingToInstall = arrayToInstall[key];
            const buildingModel = plainToInstance(BuildingModel, buildingToInstall);

            this.isModelValid(buildingModel);

            await this.buildingRepository.save(buildingModel);
        }
    }

    private isModelValid(model: any): boolean {
        const validationErrors = validateSync(model);

        if (validationErrors.length === 0) {
            return true;
        }

        console.error('Validation error', validationErrors);
        throw new Error("Validation error, see logs");
    }
}