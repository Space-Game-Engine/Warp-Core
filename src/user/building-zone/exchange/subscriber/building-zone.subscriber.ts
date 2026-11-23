import {Injectable} from '@nestjs/common';

import {InternalExchangeQuery} from '@warp-core/core/utils/internal-exchange';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {BuildingZoneNames} from '@warp-core/user/building-zone/exchange/query/building-zone.names';
import {
	BuildingZoneCapabilities,
	CalculateCapabilitiesInput,
} from '@warp-core/user/building-zone/exchange/query/types';
import {BuildingZoneService} from '@warp-core/user/building-zone/service/building-zone.service';
import {CalculateBuildingZoneCapabilitiesService} from '@warp-core/user/building-zone/service/calculate-building-zone-capabilities.service';

@Injectable()
export class BuildingZoneSubscriber {
	constructor(
		private readonly buildingZoneService: BuildingZoneService,
		private readonly calculateCapabilitiesService: CalculateBuildingZoneCapabilitiesService,
	) {}

	@InternalExchangeQuery(BuildingZoneNames.GetSingleBuildingZone)
	public getSingleBuildingZone(input: {
		localBuildingZoneId: number;
	}): Promise<BuildingZoneModel | null> {
		return this.buildingZoneService.getSingleBuildingZone(
			input.localBuildingZoneId,
		);
	}

	@InternalExchangeQuery(BuildingZoneNames.GetCalculatedCapabilities)
	public getCalculatedCapabilities(
		input: CalculateCapabilitiesInput,
	): Promise<CalculatedCapabilitiesModel> {
		return this.calculateCapabilitiesService.calculate(input);
	}

	@InternalExchangeQuery(BuildingZoneNames.GetCalculatedCapabilitiesForHabitat)
	public getCalculatedCapabilitiesForHabitat(input: {
		habitatId: number;
	}): Promise<BuildingZoneCapabilities[]> {
		return this.calculateCapabilitiesService.forHabitat(input.habitatId);
	}
}
