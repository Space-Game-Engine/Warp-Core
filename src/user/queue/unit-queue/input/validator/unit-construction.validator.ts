import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {UnitInstanceRepository} from '@warp-core/database/repository/unit-instance.repository';
import {QueueItemValidatorInterface} from '@warp-core/user/queue/core';
import {UnitQueueInputValidation} from '@warp-core/user/queue/unit-queue/input/validator/type';

/**
 * Units are built thanks to the construction capability.
 * It can be provided by a building placed in the habitat or by a unit that belongs to the habitat.
 */
@Injectable()
export class UnitConstructionValidator implements QueueItemValidatorInterface<UnitQueueInputValidation> {
	constructor(
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly unitInstanceRepository: UnitInstanceRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async validate({
		unit,
		validationError,
	}: UnitQueueInputValidation): Promise<void> {
		const buildableUnitIds = new Set<string>([
			...(await this.getUnitIdsBuildableByBuildings()),
			...(await this.getUnitIdsBuildableByUnits()),
		]);

		if (!buildableUnitIds.has(unit.id)) {
			validationError.addError(
				'unitId',
				`Unit ${unit.id} cannot be built by any building or unit in that habitat.`,
			);
		}
	}

	private async getUnitIdsBuildableByBuildings(): Promise<string[]> {
		const buildingZones =
			await this.buildingZoneRepository.getBuiltBuildingZonesForHabitat(
				this.habitatModel.id,
			);
		const unitIds: string[] = [];

		for (const buildingZone of buildingZones) {
			const levelDetails = await buildingZone.getBuildingLevelDetails();
			const playerBlueprint = await buildingZone.getPlayerBlueprint();

			unitIds.push(
				...(await this.getBuildableUnitIds(levelDetails?.capabilities)),
				...(await this.getBuildableUnitIds(playerBlueprint?.capabilities)),
			);
		}

		return unitIds;
	}

	private async getUnitIdsBuildableByUnits(): Promise<string[]> {
		const unitInstances =
			await this.unitInstanceRepository.getAllUnitInstancesForHabitat(
				this.habitatModel.id,
			);
		const checkedPlayerBlueprints = new Set<number>();
		const unitIds: string[] = [];

		for (const unitInstance of unitInstances) {
			if (checkedPlayerBlueprints.has(unitInstance.unitBlueprintPlayerId)) {
				continue;
			}
			checkedPlayerBlueprints.add(unitInstance.unitBlueprintPlayerId);

			const playerBlueprint = (await unitInstance.getPlayerBlueprint())!;
			const globalBlueprint = await playerBlueprint.getGlobalBlueprint();

			unitIds.push(
				...(await this.getBuildableUnitIds(globalBlueprint.capabilities)),
				...(await this.getBuildableUnitIds(playerBlueprint.capabilities)),
			);
		}

		return unitIds;
	}

	private async getBuildableUnitIds(
		capabilities?: CapabilitiesModel | null,
	): Promise<string[]> {
		const construction = await capabilities?.construction;
		const buildableUnits = (await construction?.buildableUnits) ?? [];

		return buildableUnits.map(buildable => buildable.unitBlueprintId);
	}
}
