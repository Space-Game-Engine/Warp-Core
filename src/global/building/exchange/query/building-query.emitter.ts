import {Inject, Injectable} from '@nestjs/common';

import {BuildingModel} from '@warp-core/database';
import {BuildingQueryNames} from '@warp-core/global/building/exchange/query/building-query.names';
import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from 'src/core/utils/internal-exchange';

@Injectable()
export class BuildingQueryEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public getBuildingById(
		buildingId: string,
	): Promise<QueryExchangeResponse<BuildingModel>> {
		return this.emitter.query<BuildingModel>({
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
