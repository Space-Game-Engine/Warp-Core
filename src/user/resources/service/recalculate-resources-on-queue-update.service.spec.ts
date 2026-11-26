import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {HabitatResourceModel} from '@warp-core/database/model/resource/habitat-resource.model';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone';
import {ResourceCalculatorService} from '@warp-core/user/resources/service/calculate/resource-calculator.service';
import {RecalculateResourcesOnQueueUpdate} from '@warp-core/user/resources/service/recalculate-resources-on-queue-update.service';

jest.mock('@warp-core/user/building-zone/exchange/query/building-zone.emitter');
jest.mock('@warp-core/database/repository/habitat-resource.repository');
jest.mock(
	'@warp-core/user/resources/service/calculate/resource-calculator.service',
);

describe('Add last calculation date for new resource producers', () => {
	let buildingZoneEmitter: jest.Mocked<BuildingZoneEmitter>;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let resourceCalculatorService: jest.Mocked<ResourceCalculatorService>;
	let recalculateResources: RecalculateResourcesOnQueueUpdate;

	const habitatId = 5;

	function prepareQueueElement(): BuildingQueueElementModel {
		return {
			endLevel: 5,
			buildingId: 'test',
			endTime: new Date(),
			getHabitatId: async (): Promise<number> => habitatId,
		} as BuildingQueueElementModel;
	}

	beforeAll(() => {
		prepareRepositoryMock(HabitatResourceRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingZoneEmitter,
				HabitatResourceRepository,
				RecalculateResourcesOnQueueUpdate,
				ResourceCalculatorService,
			],
		}).compile();

		buildingZoneEmitter = module.get(BuildingZoneEmitter);
		habitatResourceRepository = module.get(HabitatResourceRepository);
		resourceCalculatorService = module.get(ResourceCalculatorService);
		recalculateResources = module.get(RecalculateResourcesOnQueueUpdate);
	});

	describe('updateLastCalculationDateOnHabitatResource', () => {
		it('should do nothing when building does not produce anything at selected level', async () => {
			const queueElement = prepareQueueElement();

			when(buildingZoneEmitter.getCalculatedCapabilities)
				.expectCalledWith({habitatId, buildingId: 'test', level: 5})
				.mockResolvedValue({
					data: {
						production: [],
						storage: [],
					} as unknown as CalculatedCapabilitiesModel,
					error: undefined,
				});

			await recalculateResources.updateLastCalculationDateOnHabitatResource({
				queueElement,
			});

			expect(habitatResourceRepository.save).toHaveBeenCalledTimes(0);
			expect(
				resourceCalculatorService.calculateSingleResource,
			).toHaveBeenCalledTimes(0);
		});

		it('should update habitat resource when building produce resources', async () => {
			const queueElement = prepareQueueElement();

			const resources = [
				{resourceId: 'wood', lastCalculationTime: new Date()},
				{resourceId: 'coal', lastCalculationTime: new Date()},
			] as HabitatResourceModel[];

			when(buildingZoneEmitter.getCalculatedCapabilities)
				.expectCalledWith({habitatId, buildingId: 'test', level: 5})
				.mockResolvedValue({
					data: {
						production: [{resourceId: 'wood'}, {resourceId: 'coal'}],
						storage: [],
					} as unknown as CalculatedCapabilitiesModel,
					error: undefined,
				});

			when(habitatResourceRepository.getHabitatResourcesByIds)
				.expectCalledWith(['wood', 'coal'], habitatId)
				.mockResolvedValue(resources);

			await recalculateResources.updateLastCalculationDateOnHabitatResource({
				queueElement,
			});

			expect(habitatResourceRepository.save).toHaveBeenCalledTimes(1);
			expect(
				resourceCalculatorService.calculateSingleResource,
			).toHaveBeenCalledTimes(2);
			for (const resource of resources) {
				expect(resource.lastCalculationTime).toBe(queueElement.endTime);
			}
		});

		it('should throw internal emitter error when capabilities cannot be fetched', async () => {
			const queueElement = prepareQueueElement();

			when(buildingZoneEmitter.getCalculatedCapabilities)
				.expectCalledWith({habitatId, buildingId: 'test', level: 5})
				.mockResolvedValue({
					data: undefined,
					error: {message: 'boom', trace: undefined},
				});

			await expect(
				recalculateResources.updateLastCalculationDateOnHabitatResource({
					queueElement,
				}),
			).rejects.toThrow('boom');
		});
	});
});
