import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {SumCapabilitiesModule} from '@warp-core/core/utils/capabilities/sum-capabilities.module';
import {StorageTypeEnum} from '@warp-core/database/enum/storage-type.enum';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {BuildingBlueprintPlayerRepository} from '@warp-core/database/repository/building-blueprint-player.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {CalculateBuildingZoneCapabilitiesService} from '@warp-core/user/building-zone/service/calculate-building-zone-capabilities.service';

jest.mock(
	'@warp-core/database/repository/building-blueprint-global.repository',
);
jest.mock(
	'@warp-core/database/repository/building-blueprint-player.repository',
);
jest.mock('@warp-core/database/repository/building-zone.repository');

describe('Calculate building zone capabilities service', () => {
	let calculateCapabilitiesService: CalculateBuildingZoneCapabilitiesService;
	let buildingRepository: jest.Mocked<BuildingBlueprintGlobalRepository>;
	let blueprintPlayerRepository: jest.Mocked<BuildingBlueprintPlayerRepository>;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;

	const globalBuilding = {
		id: 'lumber_mill',
		buildingDetailsAtCertainLevel: [
			{
				details: {level: 1},
				capabilities: {
					production: [{resourceId: 'wood', amount: 1, interval: 1}],
					storage: [],
				},
			},
			{
				details: {level: 2},
				capabilities: {
					production: [{resourceId: 'wood', amount: 3, interval: 1}],
					storage: [{storageType: StorageTypeEnum.ANY_RESOURCE, amount: 10}],
				},
			},
			{
				details: {level: 3},
				capabilities: null,
			},
		],
	} as unknown as BuildingBlueprintGlobalModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			imports: [SumCapabilitiesModule],
			providers: [
				CalculateBuildingZoneCapabilitiesService,
				BuildingBlueprintGlobalRepository,
				BuildingBlueprintPlayerRepository,
				BuildingZoneRepository,
			],
		}).compile();

		calculateCapabilitiesService = module.get(
			CalculateBuildingZoneCapabilitiesService,
		);
		buildingRepository = module.get(BuildingBlueprintGlobalRepository);
		blueprintPlayerRepository = module.get(BuildingBlueprintPlayerRepository);
		buildingZoneRepository = module.get(BuildingZoneRepository);

		when(buildingRepository.getBuildingById)
			.calledWith('lumber_mill')
			.mockResolvedValue(globalBuilding);
	});

	describe('calculate', () => {
		it('should return global capabilities of the level when habitat has no player blueprint', async () => {
			when(blueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'lumber_mill')
				.mockResolvedValueOnce(null);

			const result = await calculateCapabilitiesService.calculate({
				habitatId: 5,
				buildingId: 'lumber_mill',
				level: 1,
			});

			expect(result.production).toEqual([
				{resourceId: 'wood', amount: 1, interval: 1},
			]);
			expect(result.storage).toEqual([]);
		});

		it('should sum global capabilities of the level with player blueprint bonuses', async () => {
			when(blueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'lumber_mill')
				.mockResolvedValueOnce({
					capabilities: {
						production: [{resourceId: 'wood', amount: 1, interval: 1}],
						storage: [{storageType: StorageTypeEnum.ANY_RESOURCE, amount: 5}],
					},
				} as unknown as BuildingBlueprintPlayerModel);

			const result = await calculateCapabilitiesService.calculate({
				habitatId: 5,
				buildingId: 'lumber_mill',
				level: 2,
			});

			expect(result.production).toEqual([
				{resourceId: 'wood', amount: 4, interval: 1},
			]);
			expect(result.storage).toEqual([
				{
					storageType: StorageTypeEnum.ANY_RESOURCE,
					resourceType: null,
					resourceId: null,
					amount: 15,
				},
			]);
		});

		it('should return only player bonuses when the level has no capabilities', async () => {
			when(blueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'lumber_mill')
				.mockResolvedValueOnce({
					capabilities: {
						production: [{resourceId: 'coal', amount: 2, interval: 4}],
						storage: [],
					},
				} as unknown as BuildingBlueprintPlayerModel);

			const result = await calculateCapabilitiesService.calculate({
				habitatId: 5,
				buildingId: 'lumber_mill',
				level: 3,
			});

			expect(result.production).toEqual([
				{resourceId: 'coal', amount: 2, interval: 4},
			]);
		});

		it('should return empty capabilities when building does not exist', async () => {
			when(buildingRepository.getBuildingById)
				.calledWith('unknown')
				.mockResolvedValue(null);
			when(blueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'unknown')
				.mockResolvedValueOnce(null);

			const result = await calculateCapabilitiesService.calculate({
				habitatId: 5,
				buildingId: 'unknown',
				level: 1,
			});

			expect(result.production).toEqual([]);
			expect(result.storage).toEqual([]);
		});
	});

	describe('forBuildingZone', () => {
		it('should return null when building zone is empty', async () => {
			const buildingZone = {
				habitatId: 5,
				level: 0,
				getPlayerBlueprint: async (): Promise<null> => null,
			} as unknown as BuildingZoneModel;

			expect(
				await calculateCapabilitiesService.forBuildingZone(buildingZone),
			).toBeNull();
			expect(buildingRepository.getBuildingById).not.toHaveBeenCalled();
		});

		it('should calculate capabilities for the level of the building zone', async () => {
			const buildingZone = {
				habitatId: 5,
				level: 2,
				getPlayerBlueprint: async (): Promise<BuildingBlueprintPlayerModel> =>
					({buildingId: 'lumber_mill'}) as BuildingBlueprintPlayerModel,
			} as unknown as BuildingZoneModel;

			when(blueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'lumber_mill')
				.mockResolvedValueOnce(null);

			const result =
				await calculateCapabilitiesService.forBuildingZone(buildingZone);

			expect(result!.production).toEqual([
				{resourceId: 'wood', amount: 3, interval: 1},
			]);
		});

		it('should calculate capabilities for provided level instead of the current one', async () => {
			const buildingZone = {
				habitatId: 5,
				level: 1,
				getPlayerBlueprint: async (): Promise<BuildingBlueprintPlayerModel> =>
					({buildingId: 'lumber_mill'}) as BuildingBlueprintPlayerModel,
			} as unknown as BuildingZoneModel;

			when(blueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'lumber_mill')
				.mockResolvedValueOnce(null);

			const result = await calculateCapabilitiesService.forBuildingZone(
				buildingZone,
				2,
			);

			expect(result!.production[0].amount).toEqual(3);
		});
	});

	describe('forHabitat', () => {
		it('should return capabilities of every built building zone', async () => {
			const builtZone = {
				id: 1,
				habitatId: 5,
				level: 1,
				getPlayerBlueprint: async (): Promise<BuildingBlueprintPlayerModel> =>
					({buildingId: 'lumber_mill'}) as BuildingBlueprintPlayerModel,
			} as unknown as BuildingZoneModel;
			const emptyZone = {
				id: 2,
				habitatId: 5,
				level: 0,
				getPlayerBlueprint: async (): Promise<null> => null,
			} as unknown as BuildingZoneModel;

			when(buildingZoneRepository.getBuiltBuildingZonesForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce([builtZone, emptyZone]);
			when(blueprintPlayerRepository.getForHabitatAndGlobalBlueprint)
				.expectCalledWith(5, 'lumber_mill')
				.mockResolvedValue(null);

			const result = await calculateCapabilitiesService.forHabitat(5);

			expect(result).toHaveLength(1);
			expect(result[0].buildingZone).toBe(builtZone);
			expect(result[0].capabilities.production[0].amount).toEqual(1);
		});
	});
});
