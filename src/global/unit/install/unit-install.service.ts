import {Injectable, Type} from '@nestjs/common';

import {
	AbstractInstallationService,
	LoadedConfig,
} from '@warp-core/core/install';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';

@Injectable()
export class UnitInstallService extends AbstractInstallationService<UnitBlueprintGlobalModel> {
	protected modelType(): Type<UnitBlueprintGlobalModel> {
		return UnitBlueprintGlobalModel;
	}

	protected parseConfig(
		loadedConfig: LoadedConfig,
	): UnitBlueprintGlobalModel[] {
		const units = (loadedConfig.units ?? []) as (Omit<
			UnitBlueprintGlobalModel,
			'tags'
		> & {tags?: string[]})[];

		// tags are written as plain strings in YAML, models expect tag rows
		return units.map(unit => ({
			...unit,
			tags: (unit.tags ?? []).map(tag => ({tag})),
		})) as unknown as UnitBlueprintGlobalModel[];
	}
}
