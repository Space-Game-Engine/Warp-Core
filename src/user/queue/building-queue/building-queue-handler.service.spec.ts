import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BuildingBlueprintQueryEmitter} from '@warp-core/user/blueprint/building-blueprint';
import {BuildingQueueHandlerService} from '@warp-core/user/queue/building-queue/building-queue-handler.service';
import {BuildingQueueProcessingEmitter} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue-processing.emitter';

jest.mock('@warp-core/database/repository/building-queue.repository');
jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock(
	'@warp-core/user/queue/building-queue/exchange/emit/building-queue-processing.emitter',
);
jest.mock(
	'@warp-core/user/blueprint/building-blueprint/exchange/query/building-blueprint-query.emitter',
);

const CREATED_PLAYER_BLUEPRINT_ID = 42;

describe('Building queue handler service test', () => {
	let buildingQueueHandlerService: BuildingQueueHandlerService;
	let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;
	let eventEmitter: jest.Mocked<BuildingQueueProcessingEmitter>;
	let buildingBlueprintEmitter: jest.Mocked<BuildingBlueprintQueryEmitter>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueueHandlerService,
				BuildingQueueRepository,
				BuildingZoneRepository,
				AuthorizedHabitatModel,
				BuildingQueueProcessingEmitter,
				BuildingBlueprintQueryEmitter,
			],
		}).compile();

		buildingQueueHandlerService = module.get(BuildingQueueHandlerService);
		buildingQueueRepository = module.get(BuildingQueueRepository);
		buildingZoneRepository = module.get(BuildingZoneRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
		eventEmitter = module.get(BuildingQueueProcessingEmitter);
		buildingBlueprintEmitter = module.get(BuildingBlueprintQueryEmitter);

		authorizedHabitatModel.id = 1;

		when(buildingBlueprintEmitter.getOrCreateBlueprintPlayer)
			.calledWith({habitatId: 1, buildingId: 'test'})
			.mockResolvedValue({
				data: {
					id: CREATED_PLAYER_BLUEPRINT_ID,
					buildingId: 'test',
				} as BuildingBlueprintPlayerModel,
				error: undefined,
			});
	});

	function prepareQueueElements(
		buildingZone: BuildingZoneModel,
		endLevels: number[],
	): BuildingQueueElementModel[] {
		const building = {id: 'test'} as BuildingBlueprintGlobalModel;

		return endLevels.map(
			(endLevel, index) =>
				({
					id: index + 1,
					buildingZone,
					building,
					buildingId: building.id,
					endLevel,
					isConsumed: false,
				}) as BuildingQueueElementModel,
		);
	}

	function expectQueueElementsToBeProcessed(
		buildingZone: BuildingZoneModel,
		queueElements: BuildingQueueElementModel[],
		expectedBlueprintPlayerId: number,
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
				{
					buildingBlueprintPlayerId: expectedBlueprintPlayerId,
					level: queueElement.endLevel,
				},
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
				buildingZone: {
					id: 1,
					level: 0,
					habitatId: 1,
					buildingBlueprintPlayerId: null,
				},
				endLevels: [1],
				expectedBlueprintPlayerId: CREATED_PLAYER_BLUEPRINT_ID,
				expectedBlueprintCreations: 1,
			},
			{
				name: 'building zone does not have building set and there are multiple queue items',
				buildingZone: {
					id: 1,
					level: 0,
					habitatId: 1,
					buildingBlueprintPlayerId: null,
				},
				endLevels: [1, 2, 3],
				expectedBlueprintPlayerId: CREATED_PLAYER_BLUEPRINT_ID,
				expectedBlueprintCreations: 1,
			},
			{
				name: 'building zone have building set and there is single queue item',
				buildingZone: {
					id: 1,
					level: 1,
					habitatId: 1,
					buildingBlueprintPlayerId: 7,
				},
				endLevels: [2],
				expectedBlueprintPlayerId: 7,
				expectedBlueprintCreations: 0,
			},
			{
				name: 'building zone have building set and there are multiple queue items',
				buildingZone: {
					id: 1,
					level: 1,
					habitatId: 1,
					buildingBlueprintPlayerId: 7,
				},
				endLevels: [2, 3, 4],
				expectedBlueprintPlayerId: 7,
				expectedBlueprintCreations: 0,
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
					singleTestCase.expectedBlueprintPlayerId,
				);
				expect(buildingZone.level).toBe(singleTestCase.endLevels.at(-1));
				expect(buildingZone.buildingBlueprintPlayerId).toBe(
					singleTestCase.expectedBlueprintPlayerId,
				);
				expect(
					buildingBlueprintEmitter.getOrCreateBlueprintPlayer,
				).toHaveBeenCalledTimes(singleTestCase.expectedBlueprintCreations);
			});
		});
	});

	describe('applyQueueElement errors', () => {
		it('should throw internal emitter error when player blueprint cannot be created', async () => {
			const buildingZone = {
				id: 1,
				level: 0,
				habitatId: 1,
				buildingBlueprintPlayerId: null,
			} as unknown as BuildingZoneModel;
			const queueElements = prepareQueueElements(buildingZone, [1]);

			when(buildingQueueRepository.getUnresolvedQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce(queueElements);
			when(buildingBlueprintEmitter.getOrCreateBlueprintPlayer)
				.calledWith({habitatId: 1, buildingId: 'test'})
				.mockResolvedValueOnce({
					data: undefined,
					error: {message: 'boom', trace: undefined},
				});

			await expect(buildingQueueHandlerService.resolveQueue()).rejects.toThrow(
				'boom',
			);
			expect(buildingZoneRepository.update).not.toHaveBeenCalled();
		});
	});

	describe('resolveQueueForSingleBuildingZone', () => {
		it('should process unresolved queue elements of provided building zone', async () => {
			const buildingZone = {
				id: 7,
				level: 1,
				habitatId: 1,
				buildingBlueprintPlayerId: 3,
			} as BuildingZoneModel;
			const queueElements = prepareQueueElements(buildingZone, [2, 3]);

			when(buildingQueueRepository.getUnresolvedQueueForSingleBuildingZone)
				.expectCalledWith(7)
				.mockResolvedValueOnce(queueElements);

			await buildingQueueHandlerService.resolveQueueForSingleBuildingZone(
				buildingZone,
			);

			expectQueueElementsToBeProcessed(buildingZone, queueElements, 3);
			expect(
				buildingQueueRepository.getUnresolvedQueueForHabitat,
			).not.toHaveBeenCalled();
		});
	});
});
