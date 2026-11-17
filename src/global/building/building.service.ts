import {Injectable} from '@nestjs/common';

import {calculateUpgradeTimeInSeconds} from '@warp-core/core/utils';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';

@Injectable()
export class BuildingService {
	constructor(private buildingRepository: BuildingBlueprintGlobalRepository) {}

	public getBuildingById(
		buildingId: string,
	): Promise<BuildingBlueprintGlobalModel | null> {
		return this.buildingRepository.getBuildingById(buildingId);
	}

	public getAllBuildings(): Promise<BuildingBlueprintGlobalModel[]> {
		return this.buildingRepository.getAllBuildings();
	}

	public async calculateTimeInSecondsToUpgradeBuilding(inputData: {
		startLevel: number;
		endLevel: number;
		buildingId: string;
	}): Promise<number> {
		const building = await this.buildingRepository.getBuildingById(
			inputData.buildingId,
		);

		if (!building) {
			throw new Error('Building does not exists');
		}

		const buildingDetails = await building.buildingDetailsAtCertainLevel;

		return calculateUpgradeTimeInSeconds(
			buildingDetails.map(singleDetails => singleDetails.details),
			inputData.startLevel,
			inputData.endLevel,
		);
	}
}
