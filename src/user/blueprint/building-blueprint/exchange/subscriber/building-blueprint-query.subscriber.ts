import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingBlueprintQueryNames} from '@warp-core/user/blueprint/building-blueprint/exchange/query/building-blueprint-query.names';
import {BuildingBlueprintPlayerService} from '@warp-core/user/blueprint/building-blueprint/service/building-blueprint-player.service';

@Injectable()
export class BuildingBlueprintQuerySubscriber {
	constructor(
		private readonly buildingBlueprintPlayerService: BuildingBlueprintPlayerService,
	) {}

	@InternalExchangeQuery(BuildingBlueprintQueryNames.GetOrCreateBlueprintPlayer)
	public getOrCreateBlueprintPlayer({
		habitatId,
		buildingId,
	}: {
		habitatId: number;
		buildingId: string;
	}): Promise<BuildingBlueprintPlayerModel> {
		return this.buildingBlueprintPlayerService.getOrCreateForHabitat(
			habitatId,
			buildingId,
		);
	}
}
