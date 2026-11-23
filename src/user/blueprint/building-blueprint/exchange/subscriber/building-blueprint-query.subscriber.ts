import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingBlueprintQueryNames} from '@warp-core/user/blueprint/building-blueprint/exchange/query/building-blueprint-query.names';
import {BuildingBlueprintPlayerService} from '@warp-core/user/blueprint/building-blueprint/service/building-blueprint-player.service';

@Injectable()
export class BuildingBlueprintQuerySubscriber {
	constructor(
		private readonly buildingBlueprintPlayerService: BuildingBlueprintPlayerService,
	) {}

	@InternalExchangeQuery(
		BuildingBlueprintQueryNames.AssignBlueprintToBuildingZone,
	)
	public assignBlueprintToBuildingZone({
		buildingZone,
		buildingId,
		level,
	}: {
		buildingZone: BuildingZoneModel;
		buildingId: string;
		level: number;
	}): Promise<void> {
		return this.buildingBlueprintPlayerService.assignToBuildingZone(
			buildingZone,
			buildingId,
			level,
		);
	}
}
