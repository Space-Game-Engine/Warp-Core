import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';
import {UnitInstanceRepository} from '@warp-core/database/repository/unit-instance.repository';
import {UnitBlueprintPlayerService} from '@warp-core/user/unit-instance/service/unit-blueprint-player.service';

@Injectable()
export class UnitInstanceService {
	constructor(
		private readonly unitInstanceRepository: UnitInstanceRepository,
		private readonly unitBlueprintPlayerService: UnitBlueprintPlayerService,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public getAllForCurrentHabitat(): Promise<UnitInstanceModel[]> {
		return this.unitInstanceRepository.getAllUnitInstancesForHabitat(
			this.habitatModel.id,
		);
	}

	/**
	 * Creates provided amount of separate unit instances.
	 * Gets or creates the player blueprint of the unit first,
	 * so it exists after the first unit is created.
	 */
	public async createUnitInstances(
		habitatId: number,
		unitId: string,
		amount: number,
	): Promise<UnitInstanceModel[]> {
		const playerBlueprint =
			await this.unitBlueprintPlayerService.getOrCreateForHabitat(
				habitatId,
				unitId,
			);

		const unitInstances = Array.from({length: amount}, () =>
			this.unitInstanceRepository.create({
				habitatId: habitatId,
				unitBlueprintPlayerId: playerBlueprint.id,
			}),
		);

		return this.unitInstanceRepository.save(unitInstances);
	}
}
