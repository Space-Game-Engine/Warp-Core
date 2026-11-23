import {Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';

import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';
import {CalculateUnitInstanceCapabilitiesService} from '@warp-core/user/unit-instance/service/calculate-unit-instance-capabilities.service';
import {UnitInstanceService} from '@warp-core/user/unit-instance/service/unit-instance.service';

@Resolver(() => UnitInstanceModel)
export class UnitInstanceResolver {
	constructor(
		private readonly unitInstanceService: UnitInstanceService,
		private readonly calculateCapabilitiesService: CalculateUnitInstanceCapabilitiesService,
	) {}

	@Query(() => [UnitInstanceModel], {
		description: 'Returns all units of logged in habitat',
		name: 'unitInstance_getAll',
	})
	public allUnitInstances(): Promise<UnitInstanceModel[]> {
		return this.unitInstanceService.getAllForCurrentHabitat();
	}

	@ResolveField()
	public async habitat(
		@Parent() unitInstance: UnitInstanceModel,
	): Promise<HabitatModel> {
		return unitInstance.habitat;
	}

	@ResolveField()
	public unit(
		@Parent() unitInstance: UnitInstanceModel,
	): Promise<UnitBlueprintGlobalModel> {
		return unitInstance.getUnit();
	}

	@ResolveField()
	public capabilities(
		@Parent() unitInstance: UnitInstanceModel,
	): Promise<CalculatedCapabilitiesModel> {
		return this.calculateCapabilitiesService.forUnitInstance(unitInstance);
	}
}
