import { Injectable } from "@nestjs/common";
import { AbstractInstalatorService } from "@warp-core/core/install/service/abstract-instalator.service";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { BuildingRepository } from "@warp-core/database/repository/building.repository";

@Injectable()
export class BuildingInstallService extends AbstractInstalatorService {
    constructor(
        private buildingRepository: BuildingRepository,
    ) {
        super();
    }
    protected getModelType() {
        return BuildingModel;
    }

    protected async saveModel(modelToSave: object): Promise<void> {
        await this.buildingRepository.save(modelToSave);
    }
}