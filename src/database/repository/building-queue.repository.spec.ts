import {Test, TestingModule} from '@nestjs/testing';
import {
	BuildingQueueElementModel,
	BuildingZoneModel,
} from '@warp-core/database/model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {when} from 'jest-when';
import {DataSource} from 'typeorm';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';
jest.mock("../transaction-manager.service");

describe('Building queue repository test', () => {
	let buildingQueueRepository: BuildingQueueRepository;
	let findOneBuildingQueueSpy: jest.SpyInstance;
	let findBuildingQueueSpy: jest.SpyInstance;
	let countBuildingQueueSpy: jest.SpyInstance;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueueRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager() {},
					},
				},
				TransactionManagerService
			],
		}).compile();

		buildingQueueRepository = module.get<BuildingQueueRepository>(
			BuildingQueueRepository,
		);
		findOneBuildingQueueSpy = jest.spyOn(buildingQueueRepository, 'findOne');
		findBuildingQueueSpy = jest.spyOn(buildingQueueRepository, 'find');
		countBuildingQueueSpy = jest.spyOn(buildingQueueRepository, 'count');
	});

	test('building queue repository object should be defined', () => {
		expect(buildingQueueRepository).toBeDefined();
	});

	describe('getCurrentBuildingQueueForHabitat', () => {
		it('should load all elements for building queue from single habitat', async () => {
			const habitatId = 5;
			const buildingQueueElements = [
				{
					id: 10,
				},
				{
					id: 11,
				},
			] as BuildingQueueElementModel[];

			when(findBuildingQueueSpy)
				.calledWith(
					expect.objectContaining({
						where: {
							buildingZone: {
								habitatId: habitatId,
							},
							endTime: expect.anything(),
						},
					}),
				)
				.mockResolvedValue(buildingQueueElements);

			const returnedBuildingZones =
				await buildingQueueRepository.getCurrentBuildingQueueForHabitat(
					habitatId,
				);

			expect(returnedBuildingZones).toEqual(buildingQueueElements);
		});
	});

	describe('getCurrentBuildingQueueForBuildingZone', () => {
		it('should return all building queue elements for single building zones', async () => {
			const buildingZone = {
				id: 5,
			} as BuildingZoneModel;

			const buildingQueueElements = [
				{
					id: 10,
				},
				{
					id: 11,
				},
			] as BuildingQueueElementModel[];

			when(findBuildingQueueSpy)
				.calledWith(
					expect.objectContaining({
						where: {
							buildingZone: {
								id: buildingZone.id,
							},
							endTime: expect.anything(),
						},
					}),
				)
				.mockResolvedValue(buildingQueueElements);

			const returnedBuildingZones =
				await buildingQueueRepository.getCurrentBuildingQueueForBuildingZone(
					buildingZone,
				);

			expect(returnedBuildingZones).toEqual(buildingQueueElements);
		});
	});

	describe('getSingleBuildingQueueElementById', () => {
		it('should return all single queue element by its id', async () => {
			const buildingQueueElementId = 5;
			const buildingQueueElement = {
				id: 10,
			} as BuildingQueueElementModel;

			when(findOneBuildingQueueSpy)
				.calledWith(
					expect.objectContaining({
						where: {
							id: buildingQueueElementId,
						},
					}),
				)
				.mockResolvedValue(buildingQueueElement);

			const returnedBuildingZones =
				await buildingQueueRepository.getSingleBuildingQueueElementById(
					buildingQueueElementId,
				);

			expect(returnedBuildingZones).toEqual(buildingQueueElement);
		});
	});

	describe('countActiveBuildingQueueElementsForHabitat', () => {
		it('should return all single queue element by its id', async () => {
			const habitatId = 5;
			const buildingQueueElements = 2;

			when(countBuildingQueueSpy)
				.calledWith(
					expect.objectContaining({
						where: {
							buildingZone: {
								habitatId: habitatId,
							},
							endTime: expect.anything(),
						},
					}),
				)
				.mockResolvedValue(buildingQueueElements);

			const returnedBuildingZonesCount =
				await buildingQueueRepository.countActiveBuildingQueueElementsForHabitat(
					habitatId,
				);

			expect(returnedBuildingZonesCount).toEqual(buildingQueueElements);
		});
	});
});
