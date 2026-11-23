import {Test, TestingModule} from '@nestjs/testing';
import {DataSource} from 'typeorm';

import {BuildingRoleEnum} from '@warp-core/database/enum/building-role.enum';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';
jest.mock('../transaction-manager.service');

describe('Building repository test', () => {
	let buildingRepository: BuildingBlueprintGlobalRepository;
	let findOneBuildingSpy: jest.SpyInstance;
	let findBuildingSpy: jest.SpyInstance;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingBlueprintGlobalRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager: (): void => {},
					},
				},
				TransactionManagerService,
			],
		}).compile();

		buildingRepository = module.get<BuildingBlueprintGlobalRepository>(
			BuildingBlueprintGlobalRepository,
		);
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
			} as unknown as BuildingBlueprintGlobalModel;

			findOneBuildingSpy.mockResolvedValue(buildingModel);

			const returnedBuilding = await buildingRepository.getBuildingById(
				buildingModel.id,
			);

			expect(returnedBuilding).toEqual(buildingModel);
			expect(findOneBuildingSpy).toHaveBeenCalledTimes(1);
			expect(findOneBuildingSpy).toHaveBeenCalledWith(
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
			} as unknown as BuildingBlueprintGlobalModel;

			findBuildingSpy.mockResolvedValue([buildingModel]);

			const returnedBuilding = await buildingRepository.getAllBuildings();

			expect(returnedBuilding).toEqual([buildingModel]);
			expect(findBuildingSpy).toHaveBeenCalledTimes(1);
		});
	});
});
