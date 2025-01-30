import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BuildingRepository} from '@warp-core/database/repository/building.repository';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {BuildingZoneService} from '@warp-core/user/building-zone/building-zone.service';
import {FirstHabitatCreatedSubscriber} from '@warp-core/user/building-zone/subscriber/first-habitat-created.subscriber';

jest.mock('@warp-core/user/building-zone/building-zone.service');
jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock('@warp-core/database/repository/building.repository');
describe('First habitat created subscriber', () => {
	let runtimeConfig: RuntimeConfig;
	let buildingZoneService: jest.Mocked<BuildingZoneService>;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let buildingRepository: jest.Mocked<BuildingRepository>;
	let firstHabitatCreated: FirstHabitatCreatedSubscriber;

	beforeAll(() => {
		prepareRepositoryMock(BuildingZoneRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingZoneService,
				BuildingZoneRepository,
				BuildingRepository,
				FirstHabitatCreatedSubscriber,
				coreConfigMock,
			],
		}).compile();

		runtimeConfig = module.get(RuntimeConfig);
		buildingZoneService = module.get(BuildingZoneService);
		buildingZoneRepository = module.get(BuildingZoneRepository);
		buildingRepository = module.get(BuildingRepository);
		firstHabitatCreated = module.get(FirstHabitatCreatedSubscriber);
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

			expect(buildingRepository.getBuildingsByIds).toBeCalledTimes(0);
			expect(buildingZoneRepository.manager.update).toBeCalledTimes(0);
		});

		it('should add building into building zone when there is building in config', async () => {
			const localBuildingId = 1;

			const buildingZoneToChange = {
				id: 1,
				localBuildingZoneId: localBuildingId,
				buildingId: undefined,
				level: 0,
			} as unknown as BuildingZoneModel;

			const buildingToSet = {
				id: 'mine',
			} as BuildingModel;

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

			await firstHabitatCreated.addBuildingsOnFirstHabitatCreation({
				habitat: habitat,
			});

			expect(buildingZoneToChange.level).toBe(1);
			expect(buildingZoneToChange.buildingId).toBe(buildingToSet.id);
			expect(buildingZoneRepository.update).toBeCalledTimes(1);
			expect(buildingZoneRepository.update).toBeCalledWith(
				buildingZoneToChange.id,
				expect.objectContaining({
					buildingId: buildingToSet.id,
					level: 1,
				}),
			);
		});
	});
});
