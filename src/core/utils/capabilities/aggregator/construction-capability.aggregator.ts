import {Injectable} from '@nestjs/common';

import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {
	CalculatedCapabilitiesModel,
	CalculatedConstructionCapabilityModel,
} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {ConstructionBuildableUnitModel} from '@warp-core/database/model/capability/construction-buildable-unit.model';

type ConstructionState = {
	buildableUnitIds: Set<
		ConstructionBuildableUnitModel['unitBlueprintId']
	> | null;
};

/**
 * Buildable units from all sources are merged, without duplicates.
 */
@Injectable()
export class ConstructionCapabilityAggregator extends CapabilityAggregatorInterface<ConstructionState> {
	public createState(): ConstructionState {
		return {buildableUnitIds: null};
	}

	public async addSource(
		state: ConstructionState,
		source: CapabilitiesModel,
	): Promise<void> {
		const construction = await source.construction;
		if (!construction) {
			return;
		}

		state.buildableUnitIds ??= new Set();
		for (const buildable of await construction.buildableUnits) {
			state.buildableUnitIds.add(buildable.unitBlueprintId);
		}
	}

	public applyToResult(
		state: ConstructionState,
		result: CalculatedCapabilitiesModel,
	): void {
		if (!state.buildableUnitIds) {
			return;
		}

		const construction = new CalculatedConstructionCapabilityModel();
		construction.buildableUnitIds = Array.from(state.buildableUnitIds);
		result.construction = construction;
	}
}
