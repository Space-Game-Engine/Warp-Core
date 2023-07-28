import {Injectable} from '@nestjs/common';
import {AbstractInstalatorService} from '@warp-core/core/install/service/abstract-instalator.service';
import {ResourceModel, ResourceRepository} from '@warp-core/database';

@Injectable()
export class ResourcesInstallService extends AbstractInstalatorService(
	ResourceModel,
) {
	constructor(private resourceRepository: ResourceRepository) {
		super();
	}

	protected async saveModel(modelToSave: ResourceModel): Promise<void> {
		await this.resourceRepository.save(modelToSave);
	}
}
