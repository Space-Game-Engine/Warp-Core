import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';
import {UnitInstanceQueryNames} from '@warp-core/user/unit-instance/exchange/query/unit-instance-query.names';
import {UnitInstanceService} from '@warp-core/user/unit-instance/service/unit-instance.service';

@Injectable()
export class UnitInstanceQuerySubscriber {
	constructor(private readonly unitInstanceService: UnitInstanceService) {}

	@InternalExchangeQuery(UnitInstanceQueryNames.CreateUnitInstances)
	public createUnitInstances({
		habitatId,
		unitId,
		amount,
	}: {
		habitatId: number;
		unitId: string;
		amount: number;
	}): Promise<UnitInstanceModel[]> {
		return this.unitInstanceService.createUnitInstances(
			habitatId,
			unitId,
			amount,
		);
	}
}
