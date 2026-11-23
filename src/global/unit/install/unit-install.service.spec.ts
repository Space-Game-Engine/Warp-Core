import {Test, TestingModule} from '@nestjs/testing';

import {UnitInstallService} from './unit-install.service';

import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';

describe('UnitInstallService', () => {
	let unitInstallService: UnitInstallService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [UnitInstallService],
		}).compile();

		unitInstallService = module.get(UnitInstallService);
	});

	describe('loadModels', () => {
		it('should return nothing when units key is missing', () => {
			expect(unitInstallService.loadModels({})).toHaveLength(0);
		});

		it('should convert plain string tags into tag models', async () => {
			const unit = {
				id: 'light_tank',
				name: 'Light tank',
				tags: ['tank', 'ground'],
				timeToBuildInSeconds: 10,
			};

			const [model] = unitInstallService.loadModels({units: [unit]});

			expect(await model.tags).toEqual([
				expect.objectContaining({tag: 'tank'}),
				expect.objectContaining({tag: 'ground'}),
			]);
		});

		it('should create unit model when unit is valid', () => {
			const unit = {
				id: 'light_tank',
				name: 'Light tank',
				timeToBuildInSeconds: 10,
			};

			const models = unitInstallService.loadModels({units: [unit]});

			expect(models).toHaveLength(1);
			expect(models[0]).toBeInstanceOf(UnitBlueprintGlobalModel);
		});
	});
});
