import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';

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
