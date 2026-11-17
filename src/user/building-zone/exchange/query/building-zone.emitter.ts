import {Inject, Injectable} from '@nestjs/common';

import {
	InternalExchangeEmitter,
	QueryExchangeResponse,
} from '@warp-core/core/utils/internal-exchange';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {BuildingZoneNames} from '@warp-core/user/building-zone/exchange/query/building-zone.names';
import {
	BuildingZoneCapabilities,
	CalculateCapabilitiesInput,
} from '@warp-core/user/building-zone/exchange/query/types';

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

	/**
	 * Effective capabilities of a building on provided level in a habitat:
	 * global blueprint capabilities of that level plus player blueprint bonuses.
	 */
	public getCalculatedCapabilities(
		input: CalculateCapabilitiesInput,
	): Promise<QueryExchangeResponse<CalculatedCapabilitiesModel>> {
		return this.emitter.query<CalculatedCapabilitiesModel>({
			eventName: BuildingZoneNames.GetCalculatedCapabilities,
			requestData: input,
		});
	}

	/**
	 * Effective capabilities of every built building zone in a habitat.
	 */
	public getCalculatedCapabilitiesForHabitat(input: {
		habitatId: number;
	}): Promise<QueryExchangeResponse<BuildingZoneCapabilities[]>> {
		return this.emitter.query<BuildingZoneCapabilities[]>({
			eventName: BuildingZoneNames.GetCalculatedCapabilitiesForHabitat,
			requestData: input,
		});
	}
}
