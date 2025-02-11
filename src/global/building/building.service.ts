import {Injectable} from '@nestjs/common';

import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingRepository} from '@warp-core/database/repository/building.repository';

@Injectable()
export class BuildingService {
	constructor(private buildingRepository: BuildingRepository) {}

	public getBuildingById(buildingId: string): Promise<BuildingModel | null> {
		return this.buildingRepository.getBuildingById(buildingId);
	}

	public getAllBuildings(): Promise<BuildingModel[]> {
		return this.buildingRepository.getAllBuildings();
	}

	public async calculateTimeInSecondsToUpgradeBuilding(inputData: {
		startLevel: number;
		endLevel: number;
		buildingId: string;
	}): Promise<number> {
		const {startLevel, endLevel} = inputData;
		const building = await this.buildingRepository.getBuildingById(
			inputData.buildingId,
		);

		if (!building) {
			throw new Error('Building does not exists');
		}

		let secondsToUpgrade = 0;

		if (startLevel === endLevel) {
			return secondsToUpgrade;
		}

		for (const buildingDetails of await building.buildingDetailsAtCertainLevel) {
			if (buildingDetails.level <= startLevel) {
				continue;
			}

			if (buildingDetails.level > endLevel) {
				break;
			}

			secondsToUpgrade += buildingDetails.timeToUpdateBuildingInSeconds;
		}

		return secondsToUpgrade;
	}
}
