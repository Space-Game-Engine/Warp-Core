import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {BuildingZoneService} from './building-zone.service';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';

jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Building Zone Service', () => {
	let buildingZoneService: BuildingZoneService;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;

	beforeAll(() => {
		prepareRepositoryMock(BuildingZoneRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingZoneService,
				BuildingZoneRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		buildingZoneService = module.get<BuildingZoneService>(BuildingZoneService);

		buildingZoneRepository = module.get(BuildingZoneRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
	});

	describe('createNewBuildingZone', () => {
		it('should create first building zone with its counter set as 1', async () => {
			const habitatId = 5;

			when(buildingZoneRepository.getMaxOfCounterPerHabitat)
				.calledWith(habitatId)
				.mockResolvedValue(0);

			await buildingZoneService.createNewBuildingZone({
				id: habitatId,
			} as HabitatModel);

			expect(buildingZoneRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({
					localBuildingZoneId: 1,
					habitatId: habitatId,
				}),
			);
		});

		it('should create second building zone with its counter set as 2', async () => {
			const habitatId = 5;

			when(buildingZoneRepository.getMaxOfCounterPerHabitat)
				.calledWith(habitatId)
				.mockResolvedValue(1);

			await buildingZoneService.createNewBuildingZone({
				id: habitatId,
			} as HabitatModel);

			expect(buildingZoneRepository.save).toHaveBeenCalledWith(
				expect.objectContaining({
					localBuildingZoneId: 2,
					habitatId: habitatId,
				}),
			);
		});
	});

	describe('getAllZonesForCurrentHabitat', () => {
		it('should return array with buildings', async () => {
			const habitatId = 5;
			const buildingZones = [
				{
					id: 1,
					level: 1,
					localBuildingZoneId: 1,
				},
				{
					id: 2,
					level: 0,
					localBuildingZoneId: 2,
				},
			] as BuildingZoneModel[];

			authorizedHabitatModel.id = habitatId;
			authorizedHabitatModel.buildingZones = buildingZones;

			const buildingZonesFromService =
				await buildingZoneService.getAllZonesForCurrentHabitat();

			expect(buildingZonesFromService).toEqual(buildingZones);
		});
	});

	describe('getSingleBuildingZone', () => {
		it('should return single building zone for provided counter', async () => {
			const localBuildingZoneId = 1;
			const habitatId = 5;
			const buildingZone = {
				id: 1,
				level: 1,
				localBuildingZoneId: localBuildingZoneId,
			} as BuildingZoneModel;

			authorizedHabitatModel.id = habitatId;
			authorizedHabitatModel.buildingZones = [buildingZone];

			const buildingZoneFromService =
				await buildingZoneService.getSingleBuildingZone(localBuildingZoneId);

			expect(buildingZoneFromService).toEqual(buildingZone);
		});

		it('should return null when local building zone id does not exists', async () => {
			const localBuildingZoneId = 10;
			const habitatId = 5;
			const buildingZone = {
				id: 1,
				level: 1,
				localBuildingZoneId: 1,
			} as BuildingZoneModel;

			authorizedHabitatModel.id = habitatId;
			authorizedHabitatModel.buildingZones = [buildingZone];

			const buildingZoneFromService =
				await buildingZoneService.getSingleBuildingZone(localBuildingZoneId);

			expect(buildingZoneFromService).toBeNull();
		});
	});
});
