import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';
import {UnitInstanceQueryNames} from '@warp-core/user/unit-instance/exchange/query/unit-instance-query.names';

@Injectable()
export class UnitInstanceQueryEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	/**
	 * Creates provided amount of unit instances in a habitat.
	 * Player blueprint of the unit is created together with the first instance.
	 */
	public createUnitInstances(input: {
		habitatId: number;
		unitId: string;
		amount: number;
	}): Promise<QueryExchangeResponse<UnitInstanceModel[]>> {
		return this.emitter.query<UnitInstanceModel[]>({
			eventName: UnitInstanceQueryNames.CreateUnitInstances,
			requestData: input,
		});
	}
}
