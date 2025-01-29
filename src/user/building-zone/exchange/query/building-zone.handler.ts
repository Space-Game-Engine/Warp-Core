import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {BuildingZoneModel} from '@warp-core/database';
import {BuildingZoneService} from '@warp-core/user/building-zone/building-zone.service';
import {BuildingZoneNames} from '@warp-core/user/building-zone/exchange/query/building-zone.names';

@Injectable()
export class BuildingZoneHandler {
	constructor(private readonly buildingZoneService: BuildingZoneService) {}

	@InternalExchangeQuery(BuildingZoneNames.GetSingleBuildingZone)
	public getSingleBuildingZone(input: {
		localBuildingZoneId: number;
	}): Promise<BuildingZoneModel | null> {
		return this.buildingZoneService.getSingleBuildingZone(
			input.localBuildingZoneId,
		);
	}
}
