import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {BuildingService} from './building.service';

import {
	BuildingModel,
	BuildingRepository,
	BuildingRoleEnum,
} from '@warp-core/database';

jest.mock('@warp-core/database/repository/building.repository');

describe('Building service test', () => {
	let buildingService: BuildingService;
	let buildingRepository: jest.Mocked<BuildingRepository>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [BuildingService, BuildingRepository],
		}).compile();

		buildingService = module.get<BuildingService>(BuildingService);
		buildingRepository = module.get(BuildingRepository);
	});

	describe('calculateTimeInSecondsToUpgradeBuilding', () => {
		it('should throw exception when building for provided id not exists', async () => {
			const buildingId = 'test';
			const startLevel = 1;
			const endLevel = 2;
			const buildingModel = null;

			when(buildingRepository.getBuildingById)
				.expectCalledWith(buildingId)
				.mockResolvedValue(buildingModel);

			try {
				await buildingService.calculateTimeInSecondsToUpgradeBuilding({
					startLevel,
					endLevel,
					buildingId,
				});
			} catch (error) {
				expect(error.message).toEqual('Building does not exists');
			}
		});

		it('should return zero when start and end level equals', async () => {
			const buildingId = 'test';
			const startLevel = 1;
			const endLevel = startLevel;
			const buildingModel = {
				id: buildingId,
				role: BuildingRoleEnum.RESOURCE_PRODUCTION,
				name: 'Test building',
				buildingDetailsAtCertainLevel: [],
			} as unknown as BuildingModel;

			when(buildingRepository.getBuildingById)
				.expectCalledWith(buildingId)
				.mockResolvedValue(buildingModel);

			const calculatedTime =
				await buildingService.calculateTimeInSecondsToUpgradeBuilding({
					startLevel,
					endLevel,
					buildingId,
				});

			expect(calculatedTime).toEqual(0);
		});

		it('should calculate time for level 2 upgrade starting from level 1', async () => {
			const buildingId = 'test';
			const startLevel = 1;
			const endLevel = 2;
			const buildingModel = {
				id: buildingId,
				role: BuildingRoleEnum.RESOURCE_PRODUCTION,
				name: 'Test building',
				buildingDetailsAtCertainLevel: [
					{
						level: 1,
						timeToUpdateBuildingInSeconds: 1,
					},
					{
						level: 2,
						timeToUpdateBuildingInSeconds: 10,
					},
					{
						level: 3,
						timeToUpdateBuildingInSeconds: 100,
					},
				],
			} as BuildingModel;

			when(buildingRepository.getBuildingById)
				.expectCalledWith(buildingId)
				.mockResolvedValue(buildingModel);

			const calculatedTime =
				await buildingService.calculateTimeInSecondsToUpgradeBuilding({
					startLevel,
					endLevel,
					buildingId,
				});

			expect(calculatedTime).toEqual(10);
		});

		it('should calculate time for level 1 upgrade starting from level 0', async () => {
			const buildingId = 'test';
			const startLevel = 0;
			const endLevel = 1;
			const buildingModel = {
				id: buildingId,
				role: BuildingRoleEnum.RESOURCE_PRODUCTION,
				name: 'Test building',
				buildingDetailsAtCertainLevel: [
					{
						level: 1,
						timeToUpdateBuildingInSeconds: 1,
					},
					{
						level: 2,
						timeToUpdateBuildingInSeconds: 10,
					},
					{
						level: 3,
						timeToUpdateBuildingInSeconds: 100,
					},
				],
			} as BuildingModel;

			when(buildingRepository.getBuildingById)
				.expectCalledWith(buildingId)
				.mockResolvedValue(buildingModel);

			const calculatedTime =
				await buildingService.calculateTimeInSecondsToUpgradeBuilding({
					startLevel,
					endLevel,
					buildingId,
				});

			expect(calculatedTime).toEqual(1);
		});

		it('should calculate time for level 3 upgrade starting from level 0', async () => {
			const buildingId = 'test';
			const startLevel = 0;
			const endLevel = 3;
			const buildingModel = {
				id: buildingId,
				role: BuildingRoleEnum.RESOURCE_PRODUCTION,
				name: 'Test building',
				buildingDetailsAtCertainLevel: [
					{
						level: 1,
						timeToUpdateBuildingInSeconds: 1,
					},
					{
						level: 2,
						timeToUpdateBuildingInSeconds: 10,
					},
					{
						level: 3,
						timeToUpdateBuildingInSeconds: 100,
					},
				],
			} as BuildingModel;

			when(buildingRepository.getBuildingById)
				.expectCalledWith(buildingId)
				.mockResolvedValue(buildingModel);

			const calculatedTime =
				await buildingService.calculateTimeInSecondsToUpgradeBuilding({
					startLevel,
					endLevel,
					buildingId,
				});

			expect(calculatedTime).toEqual(111);
		});
	});

	describe('getBuildingById', () => {
		it('should return building by its id', async () => {
			const buildingId = 'test';
			const buildingModelMock = {
				id: buildingId,
				role: BuildingRoleEnum.RESOURCE_PRODUCTION,
				name: 'Test building',
				buildingDetailsAtCertainLevel: [],
			} as unknown as BuildingModel;

			when(buildingRepository.getBuildingById)
				.expectCalledWith(buildingId)
				.mockResolvedValue(buildingModelMock);

			const buildingModel = await buildingService.getBuildingById(buildingId);

			expect(buildingModel).toEqual(buildingModelMock);
		});
	});

	describe('getAllBuildings', () => {
		it('should return multiple buildings', async () => {
			const buildingModelsMock = [
				{
					id: 'test_1',
					role: BuildingRoleEnum.RESOURCE_PRODUCTION,
					name: 'Test building 1',
					buildingDetailsAtCertainLevel: [],
				},
				{
					id: 'test_2',
					role: BuildingRoleEnum.TECHNOLOGY_PRODUCTION,
					name: 'Test building 2',
					buildingDetailsAtCertainLevel: [],
				},
			] as unknown as BuildingModel[];

			when(buildingRepository.getAllBuildings)
				.expectCalledWith()
				.mockResolvedValue(buildingModelsMock);

			const buildingModels = await buildingService.getAllBuildings();

			expect(buildingModels).toEqual(buildingModelsMock);
		});
	});
});
