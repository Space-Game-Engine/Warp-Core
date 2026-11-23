import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitQueryNames} from '@warp-core/global/unit/exchange/query/unit-query.names';
import {UnitService} from '@warp-core/global/unit/unit.service';

@Injectable()
export class UnitQuerySubscriber {
	constructor(private readonly unitService: UnitService) {}

	@InternalExchangeQuery(UnitQueryNames.GetUnitById)
	public getUnitById({
		id,
	}: {
		id: string;
	}): Promise<UnitBlueprintGlobalModel | null> {
		return this.unitService.getUnitById(id);
	}

	@InternalExchangeQuery(UnitQueryNames.GetAllUnits)
	public getAllUnits(): Promise<UnitBlueprintGlobalModel[]> {
		return this.unitService.getAllUnits();
	}
}
