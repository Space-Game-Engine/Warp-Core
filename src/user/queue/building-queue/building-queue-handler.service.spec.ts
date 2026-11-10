import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BuildingQueueHandlerService} from '@warp-core/user/queue/building-queue/building-queue-handler.service';
import {BuildingQueueProcessingEmitter} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue-processing.emitter';

jest.mock('@warp-core/database/repository/building-queue.repository');
jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock(
	'@warp-core/user/queue/building-queue/exchange/emit/building-queue-processing.emitter',
);

describe('Building queue handler service test', () => {
	let buildingQueueHandlerService: BuildingQueueHandlerService;
	let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;
	let eventEmitter: jest.Mocked<BuildingQueueProcessingEmitter>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueueHandlerService,
				BuildingQueueRepository,
				BuildingZoneRepository,
				AuthorizedHabitatModel,
				BuildingQueueProcessingEmitter,
			],
		}).compile();

		buildingQueueHandlerService = module.get(BuildingQueueHandlerService);
		buildingQueueRepository = module.get(BuildingQueueRepository);
		buildingZoneRepository = module.get(BuildingZoneRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
		eventEmitter = module.get(BuildingQueueProcessingEmitter);

		authorizedHabitatModel.id = 1;
	});

	function prepareQueueElements(
		buildingZone: BuildingZoneModel,
		endLevels: number[],
	): BuildingQueueElementModel[] {
		const building = {id: 'test'} as BuildingModel;

		return endLevels.map(
			(endLevel, index) =>
				({
					id: index + 1,
					buildingZone,
					building,
					endLevel,
					isConsumed: false,
				}) as BuildingQueueElementModel,
		);
	}

	function expectQueueElementsToBeProcessed(
		buildingZone: BuildingZoneModel,
		queueElements: BuildingQueueElementModel[],
		expectedBuildingId: string,
	): void {
		expect(buildingZoneRepository.update).toHaveBeenCalledTimes(
			queueElements.length,
		);
		expect(buildingQueueRepository.markElementAsConsumed).toHaveBeenCalledTimes(
			queueElements.length,
		);
		expect(eventEmitter.beforeProcessing).toHaveBeenCalledTimes(
			queueElements.length,
		);
		expect(eventEmitter.afterProcessing).toHaveBeenCalledTimes(
			queueElements.length,
		);

		queueElements.forEach((queueElement, index) => {
			expect(buildingZoneRepository.update).toHaveBeenNthCalledWith(
				index + 1,
				buildingZone.id,
				{buildingId: expectedBuildingId, level: queueElement.endLevel},
			);
			expect(
				buildingQueueRepository.markElementAsConsumed,
			).toHaveBeenNthCalledWith(index + 1, queueElement);
			expect(eventEmitter.beforeProcessing).toHaveBeenNthCalledWith(index + 1, {
				queueElement,
			});
			expect(eventEmitter.afterProcessing).toHaveBeenNthCalledWith(index + 1, {
				queueElement,
			});
			expect(queueElement.isConsumed).toBe(true);
		});
	}

	describe('getQueueItemsForHabitat', () => {
		it('should return current building queue for logged in habitat', async () => {
			const queueElements = [{id: 10}] as BuildingQueueElementModel[];

			when(buildingQueueRepository.getCurrentQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce(queueElements);

			expect(await buildingQueueHandlerService.getQueueItemsForHabitat()).toBe(
				queueElements,
			);
		});
	});

	describe('resolveQueue', () => {
		it('should not process anything when there are no unresolved queue elements', async () => {
			when(buildingQueueRepository.getUnresolvedQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce([]);

			await buildingQueueHandlerService.resolveQueue();

			expect(buildingZoneRepository.update).not.toHaveBeenCalled();
			expect(
				buildingQueueRepository.markElementAsConsumed,
			).not.toHaveBeenCalled();
			expect(eventEmitter.beforeProcessing).not.toHaveBeenCalled();
			expect(eventEmitter.afterProcessing).not.toHaveBeenCalled();
		});

		const testCases = [
			{
				name: 'building zone does not have building set',
				buildingZone: {id: 1, level: 0, buildingId: null},
				endLevels: [1],
				expectedBuildingId: 'test',
			},
			{
				name: 'building zone does not have building set and there are multiple queue items',
				buildingZone: {id: 1, level: 0, buildingId: null},
				endLevels: [1, 2, 3],
				expectedBuildingId: 'test',
			},
			{
				name: 'building zone have building set and there is single queue item',
				buildingZone: {id: 1, level: 1, buildingId: 'existing'},
				endLevels: [2],
				expectedBuildingId: 'existing',
			},
			{
				name: 'building zone have building set and there are multiple queue items',
				buildingZone: {id: 1, level: 1, buildingId: 'existing'},
				endLevels: [2, 3, 4],
				expectedBuildingId: 'existing',
			},
		];

		describe.each(testCases)('Consume queue elements', singleTestCase => {
			it(`should process ${singleTestCase.endLevels.length} queue items when ${singleTestCase.name}`, async () => {
				const buildingZone = {
					...singleTestCase.buildingZone,
				} as BuildingZoneModel;
				const queueElements = prepareQueueElements(
					buildingZone,
					singleTestCase.endLevels,
				);

				when(buildingQueueRepository.getUnresolvedQueueForHabitat)
					.expectCalledWith(1)
					.mockResolvedValueOnce(queueElements);

				await buildingQueueHandlerService.resolveQueue();

				expectQueueElementsToBeProcessed(
					buildingZone,
					queueElements,
					singleTestCase.expectedBuildingId,
				);
				expect(buildingZone.level).toBe(singleTestCase.endLevels.at(-1));
				expect(buildingZone.buildingId).toBe(singleTestCase.expectedBuildingId);
			});
		});
	});

	describe('resolveQueueForSingleBuildingZone', () => {
		it('should process unresolved queue elements of provided building zone', async () => {
			const buildingZone = {
				id: 7,
				level: 1,
				buildingId: 'existing',
			} as BuildingZoneModel;
			const queueElements = prepareQueueElements(buildingZone, [2, 3]);

			when(buildingQueueRepository.getUnresolvedQueueForSingleBuildingZone)
				.expectCalledWith(7)
				.mockResolvedValueOnce(queueElements);

			await buildingQueueHandlerService.resolveQueueForSingleBuildingZone(
				buildingZone,
			);

			expectQueueElementsToBeProcessed(buildingZone, queueElements, 'existing');
			expect(
				buildingQueueRepository.getUnresolvedQueueForHabitat,
			).not.toHaveBeenCalled();
		});
	});
});
