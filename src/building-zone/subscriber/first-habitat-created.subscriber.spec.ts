import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneService} from '@warp-core/building-zone/building-zone.service';
import {
	BuildingModel,
	BuildingRepository,
	BuildingZoneModel,
	BuildingZoneRepository,
	HabitatModel,
} from '@warp-core/database';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {Test, TestingModule} from '@nestjs/testing';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {FirstHabitatCreatedSubscriber} from '@warp-core/building-zone/subscriber/first-habitat-created.subscriber';
import {when} from 'jest-when';

jest.mock('@warp-core/building-zone/building-zone.service');
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

			await firstHabitatCreated.addBuildingsOnFirstHabitatCreation(
				{habitat: habitat},
				'abc',
			);

			expect(buildingRepository.getBuildingsByIds).toBeCalledTimes(0);
			expect(buildingZoneRepository.getSharedTransaction).toBeCalledTimes(0);
			expect(buildingZoneRepository.manager.update).toBeCalledTimes(0);
		});

		it('should add building into building zone when there is building in config', async () => {
			const localBuildingId = 1;

			const buildingZoneToChange = {
				id: 1,
				localBuildingZoneId: localBuildingId,
				buildingId: null,
				level: 0,
			} as BuildingZoneModel;

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

			await firstHabitatCreated.addBuildingsOnFirstHabitatCreation(
				{habitat: habitat},
				'abc',
			);

			expect(buildingZoneToChange.level).toBe(1);
			expect(buildingZoneToChange.buildingId).toBe(buildingToSet.id);
			expect(buildingZoneRepository.manager.update).toBeCalledTimes(1);
			expect(buildingZoneRepository.manager.update).toBeCalledWith(
				BuildingZoneModel,
				buildingZoneToChange.id,
				expect.objectContaining({
					buildingId: buildingToSet.id,
					level: 1,
				}),
			);
		});
	});
});
