import {Injectable, Type} from '@nestjs/common';

import {
	AbstractInstallationService,
	InstallError,
	LoadedConfig,
} from '@warp-core/core/install';
import {ResourceModel} from '@warp-core/database/model/resource.model';

@Injectable()
export class ResourcesInstallService extends AbstractInstallationService<ResourceModel> {
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
