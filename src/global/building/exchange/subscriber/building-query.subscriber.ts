import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingService} from '@warp-core/global/building/building.service';
import {BuildingQueryNames} from '@warp-core/global/building/exchange/query/building-query.names';

@Injectable()
export class BuildingQuerySubscriber {
	constructor(private readonly buildingService: BuildingService) {}

	@InternalExchangeQuery(BuildingQueryNames.GetBuildingById)
	public getBuildingById({id}: {id: string}): Promise<BuildingModel | null> {
		return this.buildingService.getBuildingById(id);
	}

	@InternalExchangeQuery(
		BuildingQueryNames.CalculateTimeInSecondsToUpgradeBuilding,
	)
	public calculateTimeInSecondsToUpgradeBuilding(inputData: {
		startLevel: number;
		endLevel: number;
		buildingId: string;
	}): Promise<number> {
		return this.buildingService.calculateTimeInSecondsToUpgradeBuilding(
			inputData,
		);
	}
}
