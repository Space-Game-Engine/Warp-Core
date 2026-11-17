import {Injectable} from '@nestjs/common';

import {
	BlueprintGlobalModelInterface,
	BlueprintPlayerModelInterface,
} from '@warp-core/core/utils';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

/**
 * Common contract for repositories that manage player blueprints.
 * Every global blueprint kind (building, unit etc.) should provide
 * its own player blueprint repository extending that class.
 */
@Injectable()
export abstract class AbstractBlueprintPlayerRepository<
	T extends BlueprintPlayerModelInterface<BlueprintGlobalModelInterface>,
> extends AbstractRepository<T> {
	/**
	 * Returns player blueprint of a habitat for provided global blueprint id,
	 * or null when the habitat did not create that kind of instance yet.
	 */
	public abstract getForHabitatAndGlobalBlueprint(
		habitatId: number,
		blueprintId: string,
	): Promise<T | null>;

	/**
	 * Returns all player blueprints known by a habitat.
	 */
	public abstract getAllForHabitat(habitatId: number): Promise<T[]>;
}
