import {Injectable, Type} from '@nestjs/common';

import {
	AbstractInstallationService,
	InstallError,
	LoadedConfig,
} from '@warp-core/core/install';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';

@Injectable()
export class BuildingInstallService extends AbstractInstallationService<BuildingBlueprintGlobalModel> {
	protected modelType(): Type<BuildingBlueprintGlobalModel> {
		return BuildingBlueprintGlobalModel;
	}

	protected parseConfig(
		loadedConfig: LoadedConfig,
	): BuildingBlueprintGlobalModel[] {
		if (loadedConfig.buildings) {
			return loadedConfig.buildings as BuildingBlueprintGlobalModel[];
		}

		throw new InstallError('Buildings key not found in installation config');
	}
}
