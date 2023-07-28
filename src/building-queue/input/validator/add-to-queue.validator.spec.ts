import {when} from 'jest-when';
import {Test, TestingModule} from '@nestjs/testing';
import {AddToQueueInput} from '@warp-core/building-queue/input/add-to-queue.input';
import {AddToQueueValidator} from '@warp-core/building-queue/input/validator/add-to-queue.validator';
import {BuildingZoneService} from '@warp-core/building-zone/building-zone.service';
import {BuildingService} from '@warp-core/building';
import {BuildingModel, BuildingZoneModel} from '@warp-core/database';
import {QueueInputValidationEvent} from '@warp-core/building-queue/event/queue-input-validation.event';
import {EventEmitter2} from '@nestjs/event-emitter';
import {QueueValidationError} from '@warp-core/building-queue/exception/queue-validation.error';

jest.mock('@warp-core/building/building.service');
jest.mock('@warp-core/building-zone/building-zone.service');

describe('Add to queue validator', () => {
	let addToQueueValidator: AddToQueueValidator;
	let buildingService: jest.Mocked<BuildingService>;
	let buildingZoneService: jest.Mocked<BuildingZoneService>;
	let eventEmitter: EventEmitter2;

	beforeEach(async () => {
		jest.clearAllMocks();

		// for some reason related to Jest it is not possible to mock that EventEmitter through  `jest.mock` function
		// because it triggers strange `decorator is not a function` error not connected to anything...
		eventEmitter = {
			emitAsync: jest.fn(),
		} as any as EventEmitter2;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingService,
				BuildingZoneService,
				AddToQueueValidator,
				{
					provide: EventEmitter2,
					useValue: eventEmitter,
				},
			],
		}).compile();

		addToQueueValidator = module.get(AddToQueueValidator);
		buildingZoneService = module.get(BuildingZoneService);
		buildingService = module.get(BuildingService);
	});

	describe('validate', () => {
		it('should throw error when provided building zone does not exists', async () => {
			const addToQueue: AddToQueueInput = {
				localBuildingZoneId: 1000,
				buildingId: 'test',
				endLevel: 10,
			};

			when(buildingZoneService.getSingleBuildingZone)
				.calledWith(addToQueue.localBuildingZoneId)
				.mockResolvedValue(null);

			try {
				await addToQueueValidator.transform(addToQueue, {
					metatype: AddToQueueInput,
				} as any);
			} catch (e) {
				expect(e).toBeInstanceOf(QueueValidationError);
				expect(e.message).toContain('Queue Validation Error');
				expect(e.validationError).toMatchObject({
					localBuildingZoneId: ['Provided building zone does not exist.'],
				});
			}
		});

		it('should throw error when building zone is not connected to any building and provided data does not have building id', async () => {
			const addToQueue: AddToQueueInput = {
				localBuildingZoneId: 1,
				buildingId: null,
				endLevel: 10,
			};

			when(buildingZoneService.getSingleBuildingZone)
				.calledWith(addToQueue.localBuildingZoneId)
				.mockResolvedValue({
					id: 1,
					level: 0,
					building: null,
				} as BuildingZoneModel);

			try {
				await addToQueueValidator.transform(addToQueue, {
					metatype: AddToQueueInput,
				} as any);
			} catch (e) {
				expect(e).toBeInstanceOf(QueueValidationError);
				expect(e.message).toContain('Queue Validation Error');
				expect(e.validationError).toMatchObject({
					buildingId: [
						'Building Id is required when current building zone does not have any building.',
					],
				});
			}
		});

		it('should throw error when building zone is not connected to any building and provided data contains unknown building id', async () => {
			const addToQueue: AddToQueueInput = {
				localBuildingZoneId: 1,
				buildingId: 'another_test',
				endLevel: 10,
			};

			when(buildingZoneService.getSingleBuildingZone)
				.calledWith(addToQueue.localBuildingZoneId)
				.mockResolvedValue({
					id: 1,
					level: 0,
					building: null,
				} as BuildingZoneModel);

			when(buildingService.getBuildingById)
				.calledWith(addToQueue.buildingId)
				.mockResolvedValue(null);

			try {
				await addToQueueValidator.transform(addToQueue, {
					metatype: AddToQueueInput,
				} as any);
			} catch (e) {
				expect(e).toBeInstanceOf(QueueValidationError);
				expect(e.message).toContain('Queue Validation Error');
				expect(e.validationError).toMatchObject({
					buildingId: ['Provided building does not exist.'],
				});
			}
		});

		it('should throw error when events collects some errors', async () => {
			const addToQueue: AddToQueueInput = {
				localBuildingZoneId: 1,
				buildingId: 'test',
				endLevel: 1,
			};

			const buildingZone = {
				id: 1,
				level: 0,
				building: null,
			} as BuildingZoneModel;

			const building = {
				id: 'test',
				buildingDetailsAtCertainLevel: [
					{
						level: 10,
					},
				],
			} as BuildingModel;

			when(buildingZoneService.getSingleBuildingZone)
				.calledWith(addToQueue.localBuildingZoneId)
				.mockResolvedValue(buildingZone);

			when(buildingService.getBuildingById)
				.calledWith(addToQueue.buildingId)
				.mockResolvedValue(building);

			when(eventEmitter.emitAsync)
				.calledWith(
					expect.stringMatching('building_queue.validating.add_to_queue'),
					expect.any(QueueInputValidationEvent),
				)
				.mockImplementation(
					async (event, queueValidatorEvent: QueueInputValidationEvent) => {
						queueValidatorEvent.addError('test', 'test error');
						return [event, queueValidatorEvent];
					},
				);

			try {
				await addToQueueValidator.transform(addToQueue, {
					metatype: AddToQueueInput,
				} as any);
			} catch (e) {
				expect(e).toBeInstanceOf(QueueValidationError);
				expect(e.message).toContain('Queue Validation Error');
				expect(e.validationError).toMatchObject({test: ['test error']});
			}
		});

		it('should validate when there are no collected errors', async () => {
			const addToQueue: AddToQueueInput = {
				localBuildingZoneId: 1,
				buildingId: 'test',
				endLevel: 1,
			};

			const buildingZone = {
				id: 1,
				level: 0,
				building: null,
			} as BuildingZoneModel;

			const building = {
				id: 'test',
				buildingDetailsAtCertainLevel: [
					{
						level: 10,
					},
				],
			} as BuildingModel;

			when(buildingZoneService.getSingleBuildingZone)
				.calledWith(addToQueue.localBuildingZoneId)
				.mockResolvedValue(buildingZone);

			when(buildingService.getBuildingById)
				.calledWith(addToQueue.buildingId)
				.mockResolvedValue(building);

			when(eventEmitter.emitAsync).calledWith(
				expect.stringMatching('building_queue.validating.add_to_queue'),
				expect.any(QueueInputValidationEvent),
			);

			await expect(
				addToQueueValidator.transform(addToQueue, {
					metatype: AddToQueueInput,
				} as any),
			).resolves.toEqual(addToQueue);
		});
	});
});
