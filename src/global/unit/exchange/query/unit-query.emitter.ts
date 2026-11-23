import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitQueryNames} from '@warp-core/global/unit/exchange/query/unit-query.names';

@Injectable()
export class UnitQueryEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public getUnitById(
		unitId: string,
	): Promise<QueryExchangeResponse<UnitBlueprintGlobalModel | null>> {
		return this.emitter.query<UnitBlueprintGlobalModel | null>({
			eventName: UnitQueryNames.GetUnitById,
			requestData: {id: unitId},
		});
	}

	public getAllUnits(): Promise<
		QueryExchangeResponse<UnitBlueprintGlobalModel[]>
	> {
		return this.emitter.query<UnitBlueprintGlobalModel[]>({
			eventName: UnitQueryNames.GetAllUnits,
			requestData: {},
		});
	}
}
