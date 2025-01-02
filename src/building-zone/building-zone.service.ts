import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {
	BuildingZoneModel,
	BuildingZoneRepository,
	HabitatModel,
} from '@warp-core/database';

@Injectable()
export class BuildingZoneService {
	constructor(
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async getAllZonesForCurrentHabitat(): Promise<BuildingZoneModel[]> {
		return this.habitatModel.buildingZones;
	}

	public async getSingleBuildingZone(
		localBuildingZoneId: number,
		habitatModel: HabitatModel = this.habitatModel,
	): Promise<BuildingZoneModel | null> {
		return (
			(await habitatModel.buildingZones).find(
				buildingZone =>
					buildingZone.localBuildingZoneId === localBuildingZoneId,
			) || null
		);
	}

	public async createNewBuildingZone(
		habitat: HabitatModel,
	): Promise<BuildingZoneModel> {
		const maxCounterPerHabitat =
			await this.buildingZoneRepository.getMaxOfCounterPerHabitat(habitat.id);

		const newBuildingZone = await this.buildingZoneRepository.save({
			localBuildingZoneId: maxCounterPerHabitat + 1,
			habitatId: habitat.id,
			level: 0,
			placement: '',
		});

		return newBuildingZone;
	}
}
