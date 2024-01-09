import {Injectable, Type} from '@nestjs/common';
import {ResourceModel, ResourceRepository} from '@warp-core/database';
import {AbstractInstallationService, InstallError, LoadedConfig} from '@warp-core/core/install';

@Injectable()
export class ResourcesInstallService extends AbstractInstallationService<ResourceModel>{
	constructor(private resourceRepository: ResourceRepository) {
		super();
	}

	protected async saveModel(modelToSave: ResourceModel): Promise<void> {
		await this.resourceRepository.save(modelToSave);
	}

	protected modelType(): Type<ResourceModel> {
		return ResourceModel;
	}

	protected parseConfig(loadedConfig: LoadedConfig): ResourceModel[] {
		if (loadedConfig.resources) {
			return loadedConfig.resources as ResourceModel[];
		}

		throw new InstallError('Resources key not found in installation config');
	}
}
