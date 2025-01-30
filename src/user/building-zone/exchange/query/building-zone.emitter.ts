import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingZoneNames} from '@warp-core/user/building-zone/exchange/query/building-zone.names';

@Injectable()
export class BuildingZoneEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public getSingleBuildingZone(input: {
		localBuildingZoneId: number;
	}): Promise<QueryExchangeResponse<BuildingZoneModel | null>> {
		return this.emitter.query<BuildingZoneModel | null>({
			eventName: BuildingZoneNames.GetSingleBuildingZone,
			requestData: input,
		});
	}
}
