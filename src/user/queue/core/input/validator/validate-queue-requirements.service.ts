import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {getLevelDetailsForUpgrade} from '@warp-core/user/queue/core/util/level-details.util';

@Injectable()
export class ValidateQueueRequirementsService {
	constructor(
		private readonly habitatResearchNodeRepository: HabitatResearchNodeRepository,
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	/**
	 * Adds error to validation error collector for every research node or building requirement
	 * of levels from start level (exclusive) to end level (inclusive) that is not met.
	 */
	public async validate(
		levelDetails: DetailsAtCertainLevelModel[],
		startLevel: number,
		endLevel: number,
		validationError: QueueValidationError,
	): Promise<void> {
		const requirements = await this.getRequirements(
			getLevelDetailsForUpgrade(levelDetails, startLevel, endLevel),
		);

		await this.validateResearchNodes(requirements, validationError);
		await this.validateBuildings(requirements, validationError);
	}

	private async validateResearchNodes(
		requirements: RequirementsPerLevelModel[],
		validationError: QueueValidationError,
	): Promise<void> {
		const requiredLevels = this.getRequiredLevels(requirements, requirement => [
			requirement.researchNodeId,
			requirement.researchNodeLevel,
		]);

		if (requiredLevels.size === 0) {
			return;
		}

		const developedResearchNodes =
			await this.habitatResearchNodeRepository.getForHabitatAndResearchNodes(
				this.habitatModel.id,
				Array.from(requiredLevels.keys()),
			);
		const developedLevels = new Map(
			developedResearchNodes.map(singleNode => [
				singleNode.researchNodeId,
				singleNode.currentLevel,
			]),
		);

		for (const [researchNodeId, requiredLevel] of requiredLevels) {
			if ((developedLevels.get(researchNodeId) ?? 0) < requiredLevel) {
				validationError.addError(
					'requirements',
					`Research node ${researchNodeId} at level ${requiredLevel} is required.`,
				);
			}
		}
	}

	private async validateBuildings(
		requirements: RequirementsPerLevelModel[],
		validationError: QueueValidationError,
	): Promise<void> {
		const requiredLevels = this.getRequiredLevels(requirements, requirement => [
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

	private async getRequirements(
		levelDetails: DetailsAtCertainLevelModel[],
	): Promise<RequirementsPerLevelModel[]> {
		const requirements: RequirementsPerLevelModel[] = [];

		for (const singleLevelDetails of levelDetails) {
			requirements.push(...((await singleLevelDetails.requirements) ?? []));
		}

		return requirements;
	}

	private getRequiredLevels(
		requirements: RequirementsPerLevelModel[],
		extractRequirement: (
			requirement: RequirementsPerLevelModel,
		) => [string | null | undefined, number | undefined],
	): Map<string, number> {
		const requiredLevels = new Map<string, number>();

		for (const requirement of requirements) {
			const [id, level] = extractRequirement(requirement);
			if (!id || !level) {
				continue;
			}

			requiredLevels.set(id, Math.max(requiredLevels.get(id) ?? 0, level));
		}

		return requiredLevels;
	}
}
