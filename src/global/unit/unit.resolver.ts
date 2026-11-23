import {Args, ID, Query, Resolver} from '@nestjs/graphql';

import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitService} from '@warp-core/global/unit/unit.service';

@Resolver(() => UnitBlueprintGlobalModel)
export class UnitResolver {
	constructor(private readonly unitService: UnitService) {}

	@Query(() => UnitBlueprintGlobalModel, {
		nullable: true,
		description: 'Returns single unit definition',
		name: 'unit_get',
	})
	public unit(
		@Args('id', {type: () => ID}) id: string,
	): Promise<UnitBlueprintGlobalModel | null> {
		return this.unitService.getUnitById(id);
	}

	@Query(() => [UnitBlueprintGlobalModel], {
		description: 'Returns all possible unit definitions',
		name: 'unit_getAll',
	})
	public allUnits(): Promise<UnitBlueprintGlobalModel[]> {
		return this.unitService.getAllUnits();
	}
}
