import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingBlueprintQueryNames} from '@warp-core/user/blueprint/building-blueprint/exchange/query/building-blueprint-query.names';

@Injectable()
export class BuildingBlueprintQueryEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public getOrCreateBlueprintPlayer(input: {
		habitatId: number;
		buildingId: string;
	}): Promise<QueryExchangeResponse<BuildingBlueprintPlayerModel>> {
		return this.emitter.query<BuildingBlueprintPlayerModel>({
			eventName: BuildingBlueprintQueryNames.GetOrCreateBlueprintPlayer,
			requestData: input,
		});
	}
}
