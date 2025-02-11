import {Test, TestingModule} from '@nestjs/testing';

import {BuildingInstallService} from './building-install.service';

import {BuildingRoleEnum} from '@warp-core/database/enum/building-role.enum';
import {BuildingModel} from '@warp-core/database/model/building.model';

describe('BuildingInstallService', () => {
	let buildingInstallService: BuildingInstallService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [BuildingInstallService],
		}).compile();

		buildingInstallService = module.get<BuildingInstallService>(
			BuildingInstallService,
		);
	});

	describe('loadModels', () => {
		it('should throw error when installation object contains errors', () => {
			const buildingModel = {
				role: 'totally_wrong_type',
				name: 'Really wrong building',
				buildingDetailsAtCertainLevel: [],
			} as unknown as BuildingModel;

			expect(() =>
				buildingInstallService.loadModels({buildings: [buildingModel]}),
			).toThrowError('Validation error, see logs');
		});

		it('should add items from array to install', async () => {
			const buildingModel = {
				id: 'production_building',
				role: BuildingRoleEnum.RESOURCE_PRODUCTION,
				name: 'Production building',
				buildingDetailsAtCertainLevel: [
					{
						id: 1,
						level: 1,
						timeToUpdateBuildingInSeconds: 10,
					},
				],
			} as BuildingModel;

			const models = buildingInstallService.loadModels({
				buildings: [buildingModel],
			});

			expect(models).toHaveLength(1);
			expect(models.pop()).toBeInstanceOf(BuildingModel);
		});
	});
});
