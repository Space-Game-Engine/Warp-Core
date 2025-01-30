import {EventEmitter2} from '@nestjs/event-emitter';
import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {BuildingQueueHandlerService} from '@warp-core/user/queue/building-queue/building-queue-handler.service';
import {default as queueItemsElements} from '@warp-core/user/queue/building-queue/datasets/building-queue-handler-resolve-queue-data';
import {QueueElementAfterProcessingEvent} from '@warp-core/user/queue/building-queue/event/queue-element-after-processing.event';
import {QueueElementBeforeProcessingEvent} from '@warp-core/user/queue/building-queue/event/queue-element-before-processing.event';

jest.mock('@warp-core/database/repository/building-queue.repository');
jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock('@nestjs/event-emitter');

describe('Building queue handler service test', () => {
	let buildingQueueHandlerService: BuildingQueueHandlerService;
	let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;
	let eventEmitter: jest.Mocked<EventEmitter2>;

	beforeAll(() => {
		prepareRepositoryMock(BuildingQueueRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueueHandlerService,
				BuildingQueueRepository,
				BuildingZoneRepository,
				AuthorizedHabitatModel,
				EventEmitter2,
			],
		}).compile();

		buildingQueueHandlerService = module.get<BuildingQueueHandlerService>(
			BuildingQueueHandlerService,
		);
		buildingQueueRepository = module.get(BuildingQueueRepository);
		buildingZoneRepository = module.get(BuildingZoneRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
		eventEmitter = module.get(EventEmitter2);

		authorizedHabitatModel.buildingZones = [];
	});

	function expectEventToBeCalled(
		queueElements: BuildingQueueElementModel[],
	): void {
		expect(eventEmitter.emitAsync).toBeCalledTimes(queueElements.length * 2);

		let counter = 0;
		for (const singleQueueElement of queueElements) {
			expect(eventEmitter.emitAsync).toHaveBeenNthCalledWith(
				++counter,
				expect.stringMatching(
					'building_queue.resolving.before_processing_element',
				),
				expect.objectContaining<QueueElementBeforeProcessingEvent>({
					queueElement: singleQueueElement,
				}),
			);

			expect(eventEmitter.emitAsync).toHaveBeenNthCalledWith(
				++counter,
				expect.stringMatching(
					'building_queue.resolving.after_processing_element',
				),
				expect.objectContaining<QueueElementAfterProcessingEvent>({
					queueElement: singleQueueElement,
				}),
			);
		}
	}

	describe('resolveQueue', () => {
		it('should not process any queue items as building queue repository not fetch any data', async () => {
			const habitatId = 1;

			authorizedHabitatModel.id = habitatId;
			when(buildingQueueRepository.getUnresolvedQueueForHabitat)
				.calledWith(habitatId)
				.mockResolvedValue([]);

			await buildingQueueHandlerService.resolveQueue();

			expectEventToBeCalled([]);
			expect(buildingQueueRepository.update).not.toBeCalled();
			expect(eventEmitter.emitAsync).not.toBeCalled();
		});

		describe.each(queueItemsElements)(
			'Consume queue elements',
			singleQueueTest => {
				function mapQueueElement(
					singleQueueElement,
					building,
					buildingZone,
				): BuildingQueueElementModel {
					let buildingZoneForQueueElement: BuildingZoneModel;

					if (
						singleQueueElement.buildingZoneId &&
						buildingZone.id != singleQueueElement.buildingZoneId
					) {
						buildingZoneForQueueElement = {
							id: singleQueueElement.buildingZoneId,
						} as BuildingZoneModel;
					} else {
						buildingZoneForQueueElement = buildingZone;
					}

					return {
						id: singleQueueElement.id,
						buildingZone: buildingZoneForQueueElement,
						buildingZoneId: buildingZoneForQueueElement.id,
						endLevel: singleQueueElement.endLevel,
						building: building,
						buildingId: building.id,
						isConsumed: false,
					} as BuildingQueueElementModel;
				}

				it(`should process ${singleQueueTest.queueItemsToBeConsumed.length} queue items when ${singleQueueTest.name}`, async () => {
					const habitatId = 1;

					const building = {
						id: singleQueueTest.buildingFromQueue.id,
					} as BuildingModel;

					const buildingZone = {
						id: singleQueueTest.buildingZoneFromQueue.id,
						level: singleQueueTest.buildingZoneFromQueue.level,
						buildingId:
							singleQueueTest.buildingZoneFromQueue.buildingId === null
								? null
								: building.id,
					} as BuildingZoneModel;

					const queueElementsToBeConsumed: BuildingQueueElementModel[] =
						singleQueueTest.queueItemsToBeConsumed.map(queueElement => {
							return mapQueueElement(queueElement, building, buildingZone);
						});
					const queueElementsToNotBeConsumed: BuildingQueueElementModel[] =
						singleQueueTest.queueItemsToNotBeConsumed.map(queueElement => {
							return mapQueueElement(queueElement, building, buildingZone);
						});

					authorizedHabitatModel.id = habitatId;
					(await authorizedHabitatModel.buildingZones).push(buildingZone);
					when(buildingQueueRepository.getUnresolvedQueueForHabitat)
						.calledWith(habitatId)
						.mockResolvedValue([
							...queueElementsToBeConsumed,
							...queueElementsToNotBeConsumed,
						]);

					await buildingQueueHandlerService.resolveQueue();

					expect(buildingQueueRepository.update).toBeCalledTimes(
						queueElementsToBeConsumed.length,
					);
					expect(buildingZoneRepository.update).toBeCalledTimes(
						queueElementsToBeConsumed.length,
					);
					let buildingQueueRepositoryCallCounter = 0;
					let buildingZoneRepositoryCallCounter = 0;
					for (const singleQueueElement of queueElementsToBeConsumed) {
						expect(buildingZoneRepository.update).nthCalledWith(
							++buildingZoneRepositoryCallCounter,
							buildingZone.id,
							{
								buildingId: buildingZone.buildingId,
								level: singleQueueElement.endLevel,
							},
						);
						expect(buildingQueueRepository.update).nthCalledWith(
							++buildingQueueRepositoryCallCounter,
							singleQueueElement.id,
							{isConsumed: true},
						);
					}
					expectEventToBeCalled(queueElementsToBeConsumed);

					if (queueElementsToBeConsumed.length > 0) {
						const queueElement: BuildingQueueElementModel = <
							BuildingQueueElementModel
						>queueElementsToBeConsumed.pop();
						expect(buildingZone.level).toBe(queueElement.endLevel);
					}
					expect(buildingZone.buildingId).toBe(building.id);
				});
			},
		);
	});
});
