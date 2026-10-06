import type {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';

/**
 * Sums time needed to upgrade an entity between provided levels
 * using its level details definitions.
 */
export function calculateUpgradeTimeInSeconds(
	levelDetails: DetailsAtCertainLevelModel[],
	startLevel: number,
	endLevel: number,
): number {
	let secondsToUpgrade = 0;

	if (startLevel === endLevel) {
		return secondsToUpgrade;
	}

	for (const singleLevelDetails of levelDetails) {
		if (singleLevelDetails.level <= startLevel) {
			continue;
		}

		if (singleLevelDetails.level > endLevel) {
			break;
		}

		secondsToUpgrade += singleLevelDetails.timeToUpdateInSeconds;
	}

	return secondsToUpgrade;
}
