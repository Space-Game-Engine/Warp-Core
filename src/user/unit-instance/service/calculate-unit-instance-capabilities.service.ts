import {Injectable} from '@nestjs/common';

import {SumCapabilitiesService} from '@warp-core/core/utils';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';

/**
 * Calculates effective capabilities of a unit:
 * global blueprint capabilities plus player blueprint bonuses.
 */
@Injectable()
export class CalculateUnitInstanceCapabilitiesService {
	constructor(
		private readonly sumCapabilitiesService: SumCapabilitiesService,
	) {}

	public async forUnitInstance(
		unitInstance: UnitInstanceModel,
	): Promise<CalculatedCapabilitiesModel> {
		const playerBlueprint = (await unitInstance.getPlayerBlueprint())!;
		const globalBlueprint = await playerBlueprint.getGlobalBlueprint();

		return this.sumCapabilitiesService.sum([
			globalBlueprint.capabilities,
			playerBlueprint.capabilities,
		]);
	}
}
