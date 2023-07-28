import {Test, TestingModule} from '@nestjs/testing';
import {BuildingRoleEnum} from '@warp-core/database/enum';
import {BuildingModel} from '@warp-core/database/model';
import {BuildingRepository} from '@warp-core/database/repository/building.repository';
import {DataSource} from 'typeorm';

describe('Building repository test', () => {
	let buildingRepository: BuildingRepository;
	let findOneBuildingSpy: jest.SpyInstance;
	let findBuildingSpy: jest.SpyInstance;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager() {},
					},
				},
			],
		}).compile();

		buildingRepository = module.get<BuildingRepository>(BuildingRepository);
		findOneBuildingSpy = jest.spyOn(buildingRepository, 'findOne');
		findBuildingSpy = jest.spyOn(buildingRepository, 'find');
	});

	test('building repository object should be defined', () => {
		expect(buildingRepository).toBeDefined();
	});

	describe('getBuildingById', () => {
		it('should return single building by provided id', async () => {
			const buildingModel = {
				id: 'test',
				role: BuildingRoleEnum.RESOURCE_PRODUCTION,
				name: 'Test building',
				buildingDetailsAtCertainLevel: [],
			} as BuildingModel;

			findOneBuildingSpy.mockResolvedValue(buildingModel);

			const returnedBuilding = await buildingRepository.getBuildingById(
				buildingModel.id,
			);

			expect(returnedBuilding).toEqual(buildingModel);
			expect(findOneBuildingSpy).toBeCalledTimes(1);
			expect(findOneBuildingSpy).toBeCalledWith(
				expect.objectContaining({
					where: {
						id: buildingModel.id,
					},
				}),
			);
		});
	});

	describe('getAllBuildings', () => {
		it('should return multiple buildings', async () => {
			const buildingModel = {
				id: 'test',
				role: BuildingRoleEnum.RESOURCE_PRODUCTION,
				name: 'Test building',
				buildingDetailsAtCertainLevel: [],
			} as BuildingModel;

			findBuildingSpy.mockResolvedValue([buildingModel]);

			const returnedBuilding = await buildingRepository.getAllBuildings();

			expect(returnedBuilding).toEqual([buildingModel]);
			expect(findBuildingSpy).toBeCalledTimes(1);
		});
	});
});
