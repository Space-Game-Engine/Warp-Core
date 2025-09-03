import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {NewHabitatEmitter} from '../exchange/emit/new-habitat.emitter';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {CreateFirstUserHabitatInput} from '@warp-core/user/habitat';
import {NewHabitatInput} from '@warp-core/user/habitat/input/new-habitat.input';
import {CreateNewHabitatService} from '@warp-core/user/habitat/service/create-new-habitat.service';

jest.mock('@warp-core/database/repository/habitat.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock('@warp-core/user/habitat/exchange/emit/new-habitat.emitter');

describe('Habitat service tests', () => {
	let createNewHabitatService: CreateNewHabitatService;
	let eventEmitter: jest.Mocked<NewHabitatEmitter>;
	let habitatRepository: jest.Mocked<HabitatRepository>;

	beforeAll(() => {
		prepareRepositoryMock(HabitatRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateNewHabitatService,
				HabitatRepository,
				NewHabitatEmitter,
			],
		}).compile();

		createNewHabitatService = module.get<CreateNewHabitatService>(
			CreateNewHabitatService,
		);
		habitatRepository = module.get(HabitatRepository);
		eventEmitter = module.get(NewHabitatEmitter);
	});

	describe('createNewHabitat', () => {
		it('should create new habitat and emit event', async () => {
			const newHabitatInput = {
				userId: 20,
				isMain: true,
				name: 'test',
			} as NewHabitatInput;

			const habitatModel = {
				id: 10,
				name: newHabitatInput.name,
				userId: newHabitatInput.userId,
				isMain: newHabitatInput.isMain,
				buildingZones: [],
			} as unknown as HabitatModel;

			when(habitatRepository.create)
				.expectCalledWith(expect.objectContaining(newHabitatInput))
				.mockReturnValueOnce(habitatModel as never);

			const returnedHabitatModel =
				await createNewHabitatService.createNewHabitat(newHabitatInput);

			expect(returnedHabitatModel).toEqual(habitatModel);
			expect(habitatRepository.save).toHaveBeenCalledWith(habitatModel);
			expect(eventEmitter.newHabitatCreatedAfterSave).toHaveBeenCalledTimes(1);
			expect(eventEmitter.newHabitatCreatedAfterSave).toHaveBeenNthCalledWith(
				1,
				{habitat: habitatModel},
			);
			expect(eventEmitter.newHabitatAfterRegistration).toHaveBeenCalledTimes(0);
		});
	});

	describe('createHabitatOnUserRegistration', () => {
		it('should create new habitat when there is no habitats for provided user id', async () => {
			const userId = 5;
			const habitatModel = {
				id: 10,
				name: 'New habitat',
				userId: userId,
				isMain: true,
				buildingZones: [],
			} as unknown as HabitatModel;
			const input: CreateFirstUserHabitatInput = {userId};

			when(habitatRepository.getHabitatsByUserId)
				.expectCalledWith(userId)
				.mockResolvedValueOnce([]);

			when(habitatRepository.create)
				.expectCalledWith(expect.objectContaining({userId: userId}))
				.mockReturnValueOnce(habitatModel as never);

			await createNewHabitatService.createHabitatOnUserRegistration(input);

			expect(habitatRepository.save).toHaveBeenCalledWith(habitatModel);
			expect(eventEmitter.newHabitatCreatedAfterSave).toHaveBeenCalledTimes(1);
			expect(eventEmitter.newHabitatCreatedAfterSave).toHaveBeenNthCalledWith(
				1,
				{habitat: habitatModel},
			);
			expect(eventEmitter.newHabitatAfterRegistration).toHaveBeenCalledTimes(1);
			expect(eventEmitter.newHabitatAfterRegistration).toHaveBeenNthCalledWith(
				1,
				{habitat: habitatModel},
			);
			expect(input.userId).toBe(habitatModel.userId);
		});

		it('should not create new habitat when there for provided user id habitats exists', async () => {
			const userId = 5;
			const habitatModel = {
				id: 10,
				name: 'New habitat',
				userId: userId,
				isMain: true,
				buildingZones: [],
			} as unknown as HabitatModel;
			const input: CreateFirstUserHabitatInput = {userId};

			when(habitatRepository.getHabitatsByUserId)
				.expectCalledWith(userId)
				.mockResolvedValueOnce([habitatModel]);

			await createNewHabitatService.createHabitatOnUserRegistration(input);
			expect(habitatRepository.manager.save).toHaveBeenCalledTimes(0);
			expect(eventEmitter.newHabitatAfterRegistration).toHaveBeenCalledTimes(0);
			expect(eventEmitter.newHabitatCreatedAfterSave).toHaveBeenCalledTimes(0);
			expect(input.userId).toBe(habitatModel.userId);
		});
	});
});
