import {Inject, Injectable} from '@nestjs/common';

import {BuildingZoneModel} from '@warp-core/database';
import {BuildingZoneNames} from '@warp-core/user/building-zone/exchange/query/building-zone.names';
import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from 'src/core/utils/internal-exchange';

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
