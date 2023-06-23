import { Injectable } from "@nestjs/common";
import { AbstractInstalatorService } from "@warp-core/core/install/service/abstract-instalator.service";
import { BuildingModel, BuildingRepository } from "@warp-core/database";

@Injectable()
export class BuildingInstallService extends AbstractInstalatorService(BuildingModel) {
    constructor(
        private buildingRepository: BuildingRepository,
    ) {
        super();
    }

    protected async saveModel(modelToSave: BuildingModel): Promise<void> {
        await this.buildingRepository.save(modelToSave);
    }
}