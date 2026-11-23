import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingBlueprintQueryNames} from '@warp-core/user/blueprint/building-blueprint/exchange/query/building-blueprint-query.names';

@Injectable()
export class BuildingBlueprintQueryEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public assignBlueprintToBuildingZone(input: {
		buildingZone: BuildingZoneModel;
		buildingId: string;
		level: number;
	}): Promise<QueryExchangeResponse<void>> {
		return this.emitter.query<void>({
			eventName: BuildingBlueprintQueryNames.AssignBlueprintToBuildingZone,
			requestData: input,
		});
	}
}
