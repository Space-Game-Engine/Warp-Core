import {Test, TestingModule} from '@nestjs/testing';
import {DataSource} from 'typeorm';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';
jest.mock('../transaction-manager.service');

describe('Habitat repository test', () => {
	let habitatRepository: HabitatRepository;
	let findOneHabitatSpy: jest.SpyInstance;
	let findHabitatSpy: jest.SpyInstance;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				HabitatRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager: (): void => {},
					},
				},
				TransactionManagerService,
			],
		}).compile();

		habitatRepository = module.get<HabitatRepository>(HabitatRepository);
		findOneHabitatSpy = jest.spyOn(habitatRepository, 'findOne');
		findHabitatSpy = jest.spyOn(habitatRepository, 'find');
	});

	test('habitat repository object should be defined', () => {
		expect(habitatRepository).toBeDefined();
	});

	describe('getHabitatById', () => {
		it('should load single habitat by its id', async () => {
			const habitatModel = {
				id: 10,
				name: 'test',
				userId: 20,
				isMain: true,
				buildingZones: [],
			} as unknown as HabitatModel;

			findOneHabitatSpy.mockResolvedValue(habitatModel);

			const returnedHabitatModel = await habitatRepository.getHabitatById(
				habitatModel.id,
			);

			expect(returnedHabitatModel).toEqual(habitatModel);
			expect(findOneHabitatSpy).toHaveBeenCalledTimes(1);
			expect(findOneHabitatSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: habitatModel.id,
					},
				}),
			);
		});
	});

	describe('getHabitatsByUserId', () => {
		it('should fetch all habitats for single user', async () => {
			const habitatModel = {
				id: 10,
				name: 'test',
				userId: 20,
				isMain: true,
				buildingZones: [],
			} as unknown as HabitatModel;

			findHabitatSpy.mockResolvedValue([habitatModel]);

			const returnedHabitatModels = await habitatRepository.getHabitatsByUserId(
				habitatModel.userId,
			);

			expect(returnedHabitatModels).toEqual([habitatModel]);
			expect(findHabitatSpy).toHaveBeenCalledTimes(1);
			expect(findHabitatSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						userId: habitatModel.userId,
					},
				}),
			);
		});
	});
});
