import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';
import {DataSource} from 'typeorm';

import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';
jest.mock('../transaction-manager.service');

describe('Building zone repository test', () => {
	let buildingZoneRepository: BuildingZoneRepository;
	let findOneBuildingZoneSpy: jest.SpyInstance;
	let findBuildingZoneSpy: jest.SpyInstance;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingZoneRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager: (): void => {},
					},
				},
				TransactionManagerService,
			],
		}).compile();

		buildingZoneRepository = module.get<BuildingZoneRepository>(
			BuildingZoneRepository,
		);
		findOneBuildingZoneSpy = jest.spyOn(buildingZoneRepository, 'findOne');
		findBuildingZoneSpy = jest.spyOn(buildingZoneRepository, 'find');
	});

	test('building zone repository object should be defined', () => {
		expect(buildingZoneRepository).toBeDefined();
	});

	describe('getAllBuildingZonesByHabitatId', () => {
		it('should load all building zones for single habitat id', async () => {
			const habitatId = 5;
			const buildingZones = [
				{
					id: 10,
					localBuildingZoneId: 1,
					level: 1,
				},
				{
					id: 11,
					localBuildingZoneId: 2,
					level: 0,
				},
			] as BuildingZoneModel[];

			when(findBuildingZoneSpy);

			findBuildingZoneSpy.mockResolvedValue(buildingZones);

			const returnedBuildingZones =
				await buildingZoneRepository.getAllBuildingZonesByHabitatId(habitatId);

			expect(returnedBuildingZones).toEqual(buildingZones);
			expect(findBuildingZoneSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						habitat: {
							id: habitatId,
						},
					},
				}),
			);
		});
	});

	describe('getSingleBuildingZone', () => {
		it('should fetch single building zone for provided counter and habitat id', async () => {
			const habitatId = 5;
			const buildingZone = {
				id: 10,
				localBuildingZoneId: 1,
				level: 1,
			} as BuildingZoneModel;

			findOneBuildingZoneSpy.mockResolvedValue(buildingZone);

			const returnedBuildingZone =
				await buildingZoneRepository.getSingleBuildingZone(
					buildingZone.localBuildingZoneId,
					habitatId,
				);

			expect(returnedBuildingZone).toEqual(buildingZone);
			expect(findOneBuildingZoneSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						localBuildingZoneId: buildingZone.localBuildingZoneId,
						habitat: {
							id: habitatId,
						},
					},
				}),
			);
		});
	});

	describe('getSingleBuildingZoneById', () => {
		it('should fetch single building zone for provided building zone id', async () => {
			const buildingZone = {
				id: 10,
				localBuildingZoneId: 1,
				level: 1,
			} as BuildingZoneModel;

			findOneBuildingZoneSpy.mockResolvedValue(buildingZone);

			const returnedBuildingZone =
				await buildingZoneRepository.getSingleBuildingZoneById(buildingZone.id);

			expect(returnedBuildingZone).toEqual(buildingZone);
			expect(findOneBuildingZoneSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: buildingZone.id,
					},
				}),
			);
		});
	});
});
