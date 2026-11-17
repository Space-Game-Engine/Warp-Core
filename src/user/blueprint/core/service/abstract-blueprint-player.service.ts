import {DeepPartial} from 'typeorm';

import {
	BlueprintGlobalModelInterface,
	BlueprintPlayerModelInterface,
} from '@warp-core/core/utils';
import {AbstractBlueprintPlayerRepository} from '@warp-core/database/repository/abstract-blueprint-player.repository';

/**
 * Shared logic of player blueprints: a player blueprint is created the first time
 * a habitat builds an instance of a global blueprint and stays afterwards.
 */
export abstract class AbstractBlueprintPlayerService<
	TGlobal extends BlueprintGlobalModelInterface,
	TPlayer extends BlueprintPlayerModelInterface<TGlobal>,
> {
	constructor(
		protected readonly blueprintPlayerRepository: AbstractBlueprintPlayerRepository<TPlayer>,
	) {}

	/**
	 * Returns existing player blueprint for provided habitat and global blueprint,
	 * or creates and saves a new one.
	 */
	public async getOrCreateForHabitat(
		habitatId: number,
		blueprintId: string,
	): Promise<TPlayer> {
		const existingBlueprint =
			await this.blueprintPlayerRepository.getForHabitatAndGlobalBlueprint(
				habitatId,
				blueprintId,
			);

		if (existingBlueprint) {
			return existingBlueprint;
		}

		const draft = this.createDraft(habitatId, blueprintId);

		return this.blueprintPlayerRepository.save(
			draft as DeepPartial<TPlayer> & TPlayer,
		);
	}

	/**
	 * Creates not saved player blueprint for provided habitat and global blueprint,
	 * with initial (empty) bonus capabilities.
	 */
	protected abstract createDraft(
		habitatId: number,
		blueprintId: string,
	): TPlayer;
}
