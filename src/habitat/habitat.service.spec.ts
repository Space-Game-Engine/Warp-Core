import {Test, TestingModule} from '@nestjs/testing';
import {HabitatService} from './habitat.service';
import {when} from 'jest-when';
import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatModel, HabitatRepository} from '@warp-core/database';

jest.mock('@warp-core/database/repository/habitat.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Habitat service tests', () => {
	let habitatService: HabitatService;
	let authorizedHabitatModel: AuthorizedHabitatModel;
	let habitatRepository: jest.Mocked<HabitatRepository>;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [HabitatService, HabitatRepository, AuthorizedHabitatModel],
		}).compile();

		habitatService = module.get<HabitatService>(HabitatService);
		habitatRepository = module.get(HabitatRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
	});

	describe('getHabitatsForLoggedIn', () => {
		it('should return array of habitats when habitats for user id exists', async () => {
			const userId = 5;
			const habitatModels = [
				{
					id: 10,
					name: 'test',
					userId: userId,
					isMain: true,
					buildingZones: [],
				},
				{
					id: 20,
					name: 'test',
					userId: userId,
					isMain: false,
					buildingZones: [],
				},
			] as HabitatModel[];

			authorizedHabitatModel.userId = userId;

			when(habitatRepository.getHabitatsByUserId)
				.expectCalledWith(userId)
				.mockResolvedValueOnce(habitatModels);

			const returnedHabitats = await habitatService.getHabitatsForLoggedIn();

			expect(returnedHabitats).toEqual(habitatModels);
		});

		it("should return empty array of habitats when user don't have any habitats", async () => {
			const userId = 5;
			const habitatModels = [] as HabitatModel[];

			authorizedHabitatModel.userId = userId;

			when(habitatRepository.getHabitatsByUserId)
				.expectCalledWith(userId)
				.mockResolvedValueOnce(habitatModels);

			const returnedHabitats = await habitatService.getHabitatsForLoggedIn();

			expect(returnedHabitats).toEqual(habitatModels);
		});
	});

	describe('getCurrentHabitat', () => {
		it('should return a single habitat for currently logged in user', async () => {
			const habitatId = 10;

			authorizedHabitatModel.id = habitatId;

			const returnedHabitat = await habitatService.getCurrentHabitat();
			expect(returnedHabitat).toEqual(authorizedHabitatModel);
		});
	});

	describe('getHabitatById', () => {
		it('should return habitat for provided id', async () => {
			const habitatId = 5;
			const habitatModel = {
				id: habitatId,
				name: 'test',
				userId: 1,
				isMain: true,
				buildingZones: [],
			} as HabitatModel;

			when(habitatRepository.getHabitatById)
				.expectCalledWith(habitatId)
				.mockResolvedValueOnce(habitatModel);

			const returnedHabitat = await habitatService.getHabitatById(habitatId);

			expect(returnedHabitat).toEqual(habitatModel);
		});
	});
});
