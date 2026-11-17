import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';

export type BuildingZoneCapabilities = {
	buildingZone: BuildingZoneModel;
	capabilities: CalculatedCapabilitiesModel;
};

export type CalculateCapabilitiesInput = {
	habitatId: number;
	buildingId: string;
	level: number;
};
