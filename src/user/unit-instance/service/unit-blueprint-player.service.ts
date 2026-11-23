import {Injectable} from '@nestjs/common';

import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitBlueprintPlayerModel} from '@warp-core/database/model/unit/unit-blueprint-player.model';
import {UnitBlueprintPlayerRepository} from '@warp-core/database/repository/unit-blueprint-player.repository';
import {AbstractBlueprintPlayerService} from '@warp-core/user/blueprint/core';

/**
 * Player blueprint is a hidden layer between a unit instance and the global blueprint.
 * It is not exposed to the user, only through effective capabilities of unit instances.
 */
@Injectable()
export class UnitBlueprintPlayerService extends AbstractBlueprintPlayerService<
	UnitBlueprintGlobalModel,
	UnitBlueprintPlayerModel
> {
	constructor(
		private readonly unitBlueprintPlayerRepository: UnitBlueprintPlayerRepository,
	) {
		super(unitBlueprintPlayerRepository);
	}

	protected createDraft(
		habitatId: number,
		unitId: string,
	): UnitBlueprintPlayerModel {
		const capabilities = new CapabilitiesModel();
		capabilities.production = [];
		capabilities.storage = [];

		return this.unitBlueprintPlayerRepository.create({
			habitatId: habitatId,
			unitId: unitId,
			capabilities: capabilities,
		});
	}
}
