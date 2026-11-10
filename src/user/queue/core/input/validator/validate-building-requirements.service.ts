import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {getRequiredLevels} from '@warp-core/user/queue/core/util/level-details.util';

@Injectable()
export class ValidateBuildingRequirementsService {
	constructor(
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	/**
	 * Adds error to validation error collector for every building requirement
	 * that is not built to required level in any building zone of the habitat.
	 */
	public async validate(
		requirements: RequirementsPerLevelModel[],
		validationError: QueueValidationError,
	): Promise<void> {
		const requiredLevels = getRequiredLevels(requirements, requirement => [
			requirement.buildingId,
			requirement.buildingLevel,
		]);

		if (requiredLevels.size === 0) {
			return;
		}

		const buildingZones =
			await this.buildingZoneRepository.getBuildingZonesForHabitatAndBuildings(
				this.habitatModel.id,
				Array.from(requiredLevels.keys()),
			);
		const builtLevels = new Map<string, number>();
		for (const singleBuildingZone of buildingZones) {
			builtLevels.set(
				singleBuildingZone.buildingId!,
				Math.max(
					builtLevels.get(singleBuildingZone.buildingId!) ?? 0,
					singleBuildingZone.level,
				),
			);
		}

		for (const [buildingId, requiredLevel] of requiredLevels) {
			if ((builtLevels.get(buildingId) ?? 0) < requiredLevel) {
				validationError.addError(
					'requirements',
					`Building ${buildingId} at level ${requiredLevel} is required.`,
				);
			}
		}
	}
}
