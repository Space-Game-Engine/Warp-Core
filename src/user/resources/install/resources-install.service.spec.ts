import {Test, TestingModule} from '@nestjs/testing';

import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {ResourcesInstallService} from '@warp-core/user/resources/install/resources-install.service';

describe('ResourcesInstallService', () => {
	let resourcesInstallService: ResourcesInstallService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [ResourcesInstallService],
		}).compile();

		resourcesInstallService = module.get<ResourcesInstallService>(
			ResourcesInstallService,
		);
	});

	describe('loadModels', () => {
		it('should throw error when loaded object contains errors', () => {
			const resourceModel = {
				name: 'Really wrong building',
				baseMaxCapacity: 'this is not a number',
				type: 'unknown type',
			} as unknown as ResourceModel;

			expect(() =>
				resourcesInstallService.loadModels({resources: [resourceModel]}),
			).toThrowError('Validation error, see logs');
		});

		it('should add items from array to install', async () => {
			const resourceModel = {
				id: 'resource',
				name: 'useful resource',
				baseMaxCapacity: 100,
				type: ResourceTypeEnum.CONSTRUCTION_RESOURCE,
			} as ResourceModel;

			const models = resourcesInstallService.loadModels({
				resources: [resourceModel],
			});

			expect(models).toHaveLength(1);
			expect(models.pop()).toBeInstanceOf(ResourceModel);
		});
	});
});
