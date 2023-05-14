import { Injectable } from "@nestjs/common";
import { AbstractInstalatorService } from "@warp-core/core/install/service/abstract-instalator.service";
import { ResourceModel } from "@warp-core/database/model/resource.model";
import { ResourceRepository } from "@warp-core/database/repository/resource.repository";

@Injectable()
export class ResourcesInstallService extends AbstractInstalatorService {

    constructor(
        private resourceRepository: ResourceRepository,
    ) {
        super();
    }
    protected getModelType() {
        return ResourceModel;
    }

    protected async saveModel(modelToSave: object): Promise<void> {
        await this.resourceRepository.save(modelToSave);
    }
}