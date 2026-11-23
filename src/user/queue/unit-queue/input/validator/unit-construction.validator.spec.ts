import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {UnitInstanceRepository} from '@warp-core/database/repository/unit-instance.repository';
import {QueueValidationError} from '@warp-core/user/queue/core';
import {UnitQueueInputValidation} from '@warp-core/user/queue/unit-queue/input/validator/type';
import {UnitConstructionValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-construction.validator';

jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock('@warp-core/database/repository/unit-instance.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Unit construction validator', () => {
	let unitConstructionValidator: UnitConstructionValidator;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let unitInstanceRepository: jest.Mocked<UnitInstanceRepository>;
	let habitatModel: AuthorizedHabitatModel;

	function constructionCapabilities(...unitIds: string[]): CapabilitiesModel {
		return {
			construction: {
				buildableUnits: unitIds.map(unitBlueprintId => ({unitBlueprintId})),
			},
		} as unknown as CapabilitiesModel;
	}

	function buildingZone(
		levelCapabilities?: CapabilitiesModel,
		bonusCapabilities?: CapabilitiesModel,
	): BuildingZoneModel {
		return {
			getBuildingLevelDetails: async () => ({capabilities: levelCapabilities}),
			getPlayerBlueprint: async () => ({capabilities: bonusCapabilities}),
		} as unknown as BuildingZoneModel;
	}

	function unitInstance(
		unitBlueprintPlayerId: number,
		globalCapabilities?: CapabilitiesModel,
		bonusCapabilities?: CapabilitiesModel,
	): UnitInstanceModel {
		return {
			unitBlueprintPlayerId,
			getPlayerBlueprint: async () => ({
				capabilities: bonusCapabilities,
				getGlobalBlueprint: async () => ({capabilities: globalCapabilities}),
			}),
		} as unknown as UnitInstanceModel;
	}

	function validationInput(unitId: string): UnitQueueInputValidation {
		return {
			unit: {id: unitId} as UnitBlueprintGlobalModel,
			validationError: new QueueValidationError(),
		} as UnitQueueInputValidation;
	}

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UnitConstructionValidator,
				BuildingZoneRepository,
				UnitInstanceRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		unitConstructionValidator = module.get(UnitConstructionValidator);
		buildingZoneRepository = module.get(BuildingZoneRepository);
		unitInstanceRepository = module.get(UnitInstanceRepository);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
		buildingZoneRepository.getBuiltBuildingZonesForHabitat.mockResolvedValue(
			[],
		);
		unitInstanceRepository.getAllUnitInstancesForHabitat.mockResolvedValue([]);
	});

	describe('validate', () => {
		it('should add error when nothing in the habitat is able to build the unit', async () => {
			const input = validationInput('engineer');

			await unitConstructionValidator.validate(input);

			expect(input.validationError.getResponse()).toEqual({
				unitId: [
					'Unit engineer cannot be built by any building or unit in that habitat.',
				],
			});
		});

		it('should pass validation when building at current level is able to build the unit', async () => {
			const input = validationInput('engineer');
			when(buildingZoneRepository.getBuiltBuildingZonesForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce([
					buildingZone(constructionCapabilities('engineer')),
				]);

			await unitConstructionValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(false);
		});

		it('should pass validation when building bonus capabilities are able to build the unit', async () => {
			const input = validationInput('engineer');
			buildingZoneRepository.getBuiltBuildingZonesForHabitat.mockResolvedValueOnce(
				[buildingZone(undefined, constructionCapabilities('engineer'))],
			);

			await unitConstructionValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(false);
		});

		it('should add error when building is able to build only other units', async () => {
			const input = validationInput('gun_turret');
			buildingZoneRepository.getBuiltBuildingZonesForHabitat.mockResolvedValueOnce(
				[buildingZone(constructionCapabilities('engineer'))],
			);

			await unitConstructionValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(true);
		});

		it('should pass validation when unit of the habitat is able to build the unit', async () => {
			const input = validationInput('gun_turret');
			when(unitInstanceRepository.getAllUnitInstancesForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce([
					unitInstance(1, constructionCapabilities('gun_turret')),
				]);

			await unitConstructionValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(false);
		});

		it('should pass validation when unit bonus capabilities are able to build the unit', async () => {
			const input = validationInput('gun_turret');
			unitInstanceRepository.getAllUnitInstancesForHabitat.mockResolvedValueOnce(
				[unitInstance(1, undefined, constructionCapabilities('gun_turret'))],
			);

			await unitConstructionValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(false);
		});

		it('should check player blueprint only once when many units share it', async () => {
			const input = validationInput('gun_turret');
			const sharedBlueprintUnit = unitInstance(1);
			const getPlayerBlueprint = jest.spyOn(
				sharedBlueprintUnit,
				'getPlayerBlueprint',
			);
			unitInstanceRepository.getAllUnitInstancesForHabitat.mockResolvedValueOnce(
				[sharedBlueprintUnit, sharedBlueprintUnit, sharedBlueprintUnit],
			);

			await unitConstructionValidator.validate(input);

			expect(getPlayerBlueprint).toHaveBeenCalledTimes(1);
		});
	});
});
