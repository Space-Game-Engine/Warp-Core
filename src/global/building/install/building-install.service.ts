import {Injectable, Type} from '@nestjs/common';

import {
	AbstractInstallationService,
	InstallError,
	LoadedConfig,
} from '@warp-core/core/install';
import {BuildingModel} from '@warp-core/database/model/building.model';

@Injectable()
export class BuildingInstallService extends AbstractInstallationService<BuildingModel> {
	protected modelType(): Type<BuildingModel> {
		return BuildingModel;
	}

	protected parseConfig(loadedConfig: LoadedConfig): BuildingModel[] {
		if (loadedConfig.buildings) {
			return loadedConfig.buildings as BuildingModel[];
		}

		throw new InstallError('Buildings key not found in installation config');
	}
}
