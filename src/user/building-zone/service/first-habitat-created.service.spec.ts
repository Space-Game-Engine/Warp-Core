import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {BuildingBlueprintQueryEmitter} from '@warp-core/user/blueprint/building-blueprint';
import {BuildingZoneService} from '@warp-core/user/building-zone/service/building-zone.service';
import {FirstHabitatCreatedService} from '@warp-core/user/building-zone/service/first-habitat-created.service';

jest.mock('@warp-core/user/building-zone/service/building-zone.service');
jest.mock(
	'@warp-core/database/repository/building-blueprint-global.repository',
);
jest.mock(
	'@warp-core/user/blueprint/building-blueprint/exchange/query/building-blueprint-query.emitter',
);
describe('First habitat created subscriber', () => {
	let runtimeConfig: RuntimeConfig;
	let buildingZoneService: jest.Mocked<BuildingZoneService>;
	let buildingRepository: jest.Mocked<BuildingBlueprintGlobalRepository>;
	let buildingBlueprintEmitter: jest.Mocked<BuildingBlueprintQueryEmitter>;
	let firstHabitatCreated: FirstHabitatCreatedService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingZoneService,
				BuildingBlueprintGlobalRepository,
				BuildingBlueprintQueryEmitter,
				FirstHabitatCreatedService,
				coreConfigMock,
			],
		}).compile();

		runtimeConfig = module.get(RuntimeConfig);
		buildingZoneService = module.get(BuildingZoneService);
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
				buildingBlueprintEmitter.assignBlueprintToBuildingZone,
			).toHaveBeenCalledTimes(0);
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

			when(buildingBlueprintEmitter.assignBlueprintToBuildingZone)
				.expectCalledWith({
					buildingZone: buildingZoneToChange,
					buildingId: 'mine',
					level: 1,
				})
				.mockResolvedValue({data: undefined, error: undefined});

			await firstHabitatCreated.addBuildingsOnFirstHabitatCreation({
				habitat: habitat,
			});

			expect(
				buildingBlueprintEmitter.assignBlueprintToBuildingZone,
			).toHaveBeenCalledTimes(1);
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
			when(buildingBlueprintEmitter.assignBlueprintToBuildingZone)
				.expectCalledWith({
					buildingZone: buildingZoneToChange,
					buildingId: 'mine',
					level: 1,
				})
				.mockResolvedValue({
					data: undefined,
					error: {message: 'boom', trace: undefined},
				});

			await expect(
				firstHabitatCreated.addBuildingsOnFirstHabitatCreation({habitat}),
			).rejects.toThrow('boom');
		});
	});
});
