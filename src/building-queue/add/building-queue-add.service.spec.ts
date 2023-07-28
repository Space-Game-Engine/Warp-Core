import {PrepareSingleBuildingQueueElementService} from '@warp-core/building-queue/add/prepare-single-building-queue-element.service';
import {Test, TestingModule} from '@nestjs/testing';
import {
	BuildingQueueElementModel,
	BuildingQueueRepository,
} from '@warp-core/database';
import {when} from 'jest-when';
import {AddToQueueInput} from '@warp-core/building-queue/input/add-to-queue.input';
import {BuildingQueueAddService} from '@warp-core/building-queue/add/building-queue-add.service';
import {EventEmitter2} from '@nestjs/event-emitter';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {
	QueueElementAfterProcessingEvent,
	QueueElementBeforeProcessingEvent,
} from '@warp-core/building-queue';

jest.mock('@warp-core/database/repository/building-queue.repository');
jest.mock(
	'@warp-core/building-queue/add/prepare-single-building-queue-element.service',
);

describe('Building queue element is saved', () => {
	let buildingQueueAddElement: BuildingQueueAddService;
	let prepareBuildingQueueElement: jest.Mocked<PrepareSingleBuildingQueueElementService>;
	let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
	let eventEmitter: EventEmitter2;

	beforeAll(() => {
		prepareRepositoryMock(BuildingQueueRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();
		eventEmitter = {
			emitAsync: jest.fn(),
		} as any as EventEmitter2;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueueAddService,
				PrepareSingleBuildingQueueElementService,
				BuildingQueueRepository,
				{
					provide: EventEmitter2,
					useValue: eventEmitter,
				},
			],
		}).compile();

		buildingQueueAddElement = module.get(BuildingQueueAddService);
		buildingQueueRepository = module.get(BuildingQueueRepository);
		prepareBuildingQueueElement = module.get(
			PrepareSingleBuildingQueueElementService,
		);
	});

	describe('processAndConsumeResources', () => {
		it('should save a queue element and commit transaction', async () => {
			const addToQueueElement = {
				localBuildingZoneId: 1,
				endLevel: 5,
			} as AddToQueueInput;

			const draftBuildingQueueElement = {
				id: 1,
			} as BuildingQueueElementModel;

			const entityManager = buildingQueueRepository.getSharedTransaction('123');

			when(prepareBuildingQueueElement.getQueueElement)
				.expectCalledWith(addToQueueElement)
				.mockResolvedValue(draftBuildingQueueElement);

			when(entityManager.save)
				.calledWith(BuildingQueueElementModel, draftBuildingQueueElement)
				.mockResolvedValue(draftBuildingQueueElement);

			const processedQueueElement =
				await buildingQueueAddElement.processAndConsumeResources(
					addToQueueElement,
				);

			expect(processedQueueElement).toEqual(draftBuildingQueueElement);
			expect(buildingQueueRepository.commitSharedTransaction).toBeCalledTimes(
				1,
			);
			expect(eventEmitter.emitAsync).toBeCalledTimes(2);
			expect(eventEmitter.emitAsync).toHaveBeenNthCalledWith(
				1,
				expect.stringMatching(
					'building_queue.adding.before_processing_element',
				),
				expect.any(QueueElementBeforeProcessingEvent),
			);
			expect(eventEmitter.emitAsync).toHaveBeenNthCalledWith(
				2,
				expect.stringMatching('building_queue.adding.after_processing_element'),
				expect.any(QueueElementAfterProcessingEvent),
				expect.anything(),
			);
		});

		it('should rollback shared transaction when event throws error', async () => {
			const addToQueueElement = {
				localBuildingZoneId: 1,
				endLevel: 5,
			} as AddToQueueInput;

			const draftBuildingQueueElement = {
				id: 1,
			} as BuildingQueueElementModel;

			const entityManager = buildingQueueRepository.getSharedTransaction('123');

			when(prepareBuildingQueueElement.getQueueElement)
				.expectCalledWith(addToQueueElement)
				.mockResolvedValue(draftBuildingQueueElement);

			when(entityManager.save)
				.calledWith(BuildingQueueElementModel, draftBuildingQueueElement)
				.mockResolvedValue(draftBuildingQueueElement);

			when(eventEmitter.emitAsync)
				.calledWith(
					'building_queue.adding.after_processing_element',
					expect.any(QueueElementAfterProcessingEvent),
					expect.anything(),
				)
				.mockRejectedValue(new Error('something went wrong'));

			await expect(
				buildingQueueAddElement.processAndConsumeResources(addToQueueElement),
			).rejects.toThrowError('something went wrong');
		});
	});
});
