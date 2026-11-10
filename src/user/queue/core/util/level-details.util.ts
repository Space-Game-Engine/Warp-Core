import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';

/**
 * Returns level details that have to be passed to upgrade
 * from start level (exclusive) to end level (inclusive).
 */
export function getLevelDetailsForUpgrade(
	levelDetails: DetailsAtCertainLevelModel[],
	startLevel: number,
	endLevel: number,
): DetailsAtCertainLevelModel[] {
	return levelDetails.filter(
		singleLevelDetails =>
			singleLevelDetails.level > startLevel &&
			singleLevelDetails.level <= endLevel,
	);
}

/**
 * Returns requirements of all provided level details.
 */
export async function getRequirements(
	levelDetails: DetailsAtCertainLevelModel[],
): Promise<RequirementsPerLevelModel[]> {
	const requirements: RequirementsPerLevelModel[] = [];

	for (const singleLevelDetails of levelDetails) {
		requirements.push(...((await singleLevelDetails.requirements) ?? []));
	}

	return requirements;
}

/**
 * Returns highest required level for every id extracted from requirements.
 * Requirements without id or level are skipped.
 */
export function getRequiredLevels(
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
