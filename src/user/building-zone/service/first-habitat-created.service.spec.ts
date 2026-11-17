import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {BuildingBlueprintQueryEmitter} from '@warp-core/user/blueprint/building-blueprint';
import {BuildingZoneService} from '@warp-core/user/building-zone/service/building-zone.service';
import {FirstHabitatCreatedService} from '@warp-core/user/building-zone/service/first-habitat-created.service';

jest.mock('@warp-core/user/building-zone/service/building-zone.service');
jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock(
	'@warp-core/database/repository/building-blueprint-global.repository',
);
jest.mock(
	'@warp-core/user/blueprint/building-blueprint/exchange/query/building-blueprint-query.emitter',
);
describe('First habitat created subscriber', () => {
	let runtimeConfig: RuntimeConfig;
	let buildingZoneService: jest.Mocked<BuildingZoneService>;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let buildingRepository: jest.Mocked<BuildingBlueprintGlobalRepository>;
	let buildingBlueprintEmitter: jest.Mocked<BuildingBlueprintQueryEmitter>;
	let firstHabitatCreated: FirstHabitatCreatedService;

	beforeAll(() => {
		prepareRepositoryMock(BuildingZoneRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingZoneService,
				BuildingZoneRepository,
				BuildingBlueprintGlobalRepository,
				BuildingBlueprintQueryEmitter,
				FirstHabitatCreatedService,
				coreConfigMock,
			],
		}).compile();

		runtimeConfig = module.get(RuntimeConfig);
		buildingZoneService = module.get(BuildingZoneService);
		buildingZoneRepository = module.get(BuildingZoneRepository);
		buildingRepository = module.get(BuildingBlueprintGlobalRepository);
		buildingBlueprintEmitter = module.get(BuildingBlueprintQueryEmitter);
		firstHabitatCreated = module.get(FirstHabitatCreatedService);
	});

	describe('addBuildingsOnFirstHabitatCreation', () => {
		it('should not add any building into building zone when config is empty', async () => {
			runtimeConfig.habitat.onStart.buildings = [];
			const habitat = {
				id: 1,
			} as HabitatModel;

			await firstHabitatCreated.addBuildingsOnFirstHabitatCreation({
				habitat: habitat,
			});

			expect(buildingRepository.getBuildingsByIds).toHaveBeenCalledTimes(0);
			expect(
				buildingBlueprintEmitter.getOrCreateBlueprintPlayer,
			).toHaveBeenCalledTimes(0);
			expect(buildingZoneRepository.manager.update).toHaveBeenCalledTimes(0);
		});

		it('should add building into building zone when there is building in config', async () => {
			const localBuildingId = 1;

			const buildingZoneToChange = {
				id: 1,
				localBuildingZoneId: localBuildingId,
				buildingBlueprintPlayerId: null,
				level: 0,
			} as unknown as BuildingZoneModel;

			const buildingToSet = {
				id: 'mine',
			} as BuildingBlueprintGlobalModel;

			const playerBlueprint = {
				id: 15,
				buildingId: 'mine',
			} as BuildingBlueprintPlayerModel;

			const habitat = {
				id: 1,
			} as HabitatModel;

			runtimeConfig.habitat.onStart.buildings = [
				{
					localBuildingZoneId: localBuildingId,
					id: buildingToSet.id,
					level: 1,
				},
			];

			when(buildingRepository.getBuildingsByIds)
				.expectCalledWith(['mine'])
				.mockResolvedValue([buildingToSet]);

			when(buildingZoneService.getSingleBuildingZone)
				.expectCalledWith(localBuildingId, habitat)
				.mockResolvedValue(buildingZoneToChange);

			when(buildingBlueprintEmitter.getOrCreateBlueprintPlayer)
				.expectCalledWith({habitatId: habitat.id, buildingId: 'mine'})
				.mockResolvedValue({data: playerBlueprint, error: undefined});

			await firstHabitatCreated.addBuildingsOnFirstHabitatCreation({
				habitat: habitat,
			});

			expect(buildingZoneToChange.level).toBe(1);
			expect(buildingZoneToChange.buildingBlueprintPlayerId).toBe(
				playerBlueprint.id,
			);
			expect(buildingZoneRepository.update).toHaveBeenCalledTimes(1);
			expect(buildingZoneRepository.update).toHaveBeenCalledWith(
				buildingZoneToChange.id,
				expect.objectContaining({
					buildingBlueprintPlayerId: playerBlueprint.id,
					level: 1,
				}),
			);
		});

		it('should throw internal emitter error when player blueprint cannot be created', async () => {
			const buildingZoneToChange = {
				id: 1,
				localBuildingZoneId: 1,
				buildingBlueprintPlayerId: null,
				level: 0,
			} as unknown as BuildingZoneModel;
			const habitat = {id: 1} as HabitatModel;

			runtimeConfig.habitat.onStart.buildings = [
				{localBuildingZoneId: 1, id: 'mine', level: 1},
			];

			when(buildingRepository.getBuildingsByIds)
				.expectCalledWith(['mine'])
				.mockResolvedValue([{id: 'mine'} as BuildingBlueprintGlobalModel]);
			when(buildingZoneService.getSingleBuildingZone)
				.expectCalledWith(1, habitat)
				.mockResolvedValue(buildingZoneToChange);
			when(buildingBlueprintEmitter.getOrCreateBlueprintPlayer)
				.expectCalledWith({habitatId: 1, buildingId: 'mine'})
				.mockResolvedValue({
					data: undefined,
					error: {message: 'boom', trace: undefined},
				});

			await expect(
				firstHabitatCreated.addBuildingsOnFirstHabitatCreation({habitat}),
			).rejects.toThrow('boom');
			expect(buildingZoneRepository.update).not.toHaveBeenCalled();
		});
	});
});
