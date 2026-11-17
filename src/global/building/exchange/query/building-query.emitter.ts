import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingQueryNames} from '@warp-core/global/building/exchange/query/building-query.names';

@Injectable()
export class BuildingQueryEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public getBuildingById(
		buildingId: string,
	): Promise<QueryExchangeResponse<BuildingBlueprintGlobalModel | null>> {
		return this.emitter.query<BuildingBlueprintGlobalModel | null>({
			eventName: BuildingQueryNames.GetBuildingById,
			requestData: {id: buildingId},
		});
	}

	public calculateTimeInSecondsToUpgradeBuilding(inputData: {
		startLevel: number;
		endLevel: number;
		buildingId: string;
	}): Promise<QueryExchangeResponse<number>> {
		return this.emitter.query<number>({
			eventName: BuildingQueryNames.CalculateTimeInSecondsToUpgradeBuilding,
			requestData: inputData,
		});
	}
}
