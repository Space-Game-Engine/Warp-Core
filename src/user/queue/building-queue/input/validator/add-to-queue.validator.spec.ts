import {ArgumentMetadata} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';
import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingQueryEmitter} from '@warp-core/global/building';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone';
import {QueueInputValidationEvent} from '@warp-core/user/queue/building-queue/event/queue-input-validation.event';
import {QueueValidationError} from '@warp-core/user/queue/building-queue/exception/queue-validation.error';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {AddToQueueValidator} from '@warp-core/user/queue/building-queue/input/validator/add-to-queue.validator';

jest.mock('@warp-core/global/building/exchange/query/building-query.emitter');
jest.mock('@warp-core/user/building-zone/exchange/query/building-zone.emitter');

describe('Add to queue validator', () => {
	let addToQueueValidator: AddToQueueValidator;
	let buildingService: jest.Mocked<BuildingQueryEmitter>;
	let buildingZoneService: jest.Mocked<BuildingZoneEmitter>;
	let eventEmitter: EventEmitter2;

	beforeEach(async () => {
		jest.clearAllMocks();

		// for some reason related to Jest it is not possible to mock that EventEmitter through  `jest.mock` function
		// because it triggers strange `decorator is not a function` error not connected to anything...
		eventEmitter = {
			emitAsync: jest.fn(),
		} as unknown as EventEmitter2;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueryEmitter,
				BuildingZoneEmitter,
				AddToQueueValidator,
				{
					provide: EventEmitter2,
					useValue: eventEmitter,
				},
			],
		}).compile();

		addToQueueValidator = module.get(AddToQueueValidator);
		buildingZoneService = module.get(BuildingZoneEmitter);
		buildingService = module.get(BuildingQueryEmitter);
	});

	describe('validate', () => {
		it('should throw error when provided building zone does not exists', async () => {
			const addToQueue: AddToQueueInput = {
				localBuildingZoneId: 1000,
				buildingId: 'test',
				endLevel: 10,
			};

			when(buildingZoneService.getSingleBuildingZone)
				.calledWith({localBuildingZoneId: addToQueue.localBuildingZoneId})
				.mockResolvedValue({data: null, error: undefined});

			try {
				await addToQueueValidator.transform(addToQueue, {
					metatype: AddToQueueInput,
				} as ArgumentMetadata);
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
				.calledWith({localBuildingZoneId: addToQueue.localBuildingZoneId})
				.mockResolvedValue({
					data: {
						id: 1,
						level: 0,
						building: null,
					} as unknown as BuildingZoneModel,
					error: undefined,
				});

			try {
				await addToQueueValidator.transform(addToQueue, {
					metatype: AddToQueueInput,
				} as ArgumentMetadata);
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
				.calledWith({localBuildingZoneId: addToQueue.localBuildingZoneId})
				.mockResolvedValue({
					data: {
						id: 1,
						level: 0,
						building: null,
					} as unknown as BuildingZoneModel,
					error: undefined,
				});

			when(buildingService.getBuildingById)
				.calledWith(addToQueue.buildingId as string)
				.mockResolvedValue({data: null, error: undefined});

			try {
				await addToQueueValidator.transform(addToQueue, {
					metatype: AddToQueueInput,
				} as ArgumentMetadata);
			} catch (e) {
				expect(e).toBeInstanceOf(QueueValidationError);
				expect(e.message).toContain('Queue Validation Error');
				expect(e.validationError).toMatchObject({
					buildingId: ['Provided building does not exist.'],
				});
			}
		});

		it('should throw error when exchange collects some errors', async () => {
			const addToQueue: AddToQueueInput = {
				localBuildingZoneId: 1,
				buildingId: 'test',
				endLevel: 1,
			};

			const buildingZone = {
				id: 1,
				level: 0,
				building: null,
			} as unknown as BuildingZoneModel;

			const building = {
				id: 'test',
				buildingDetailsAtCertainLevel: [
					{
						level: 10,
					},
				],
			} as BuildingModel;

			when(buildingZoneService.getSingleBuildingZone)
				.calledWith({localBuildingZoneId: addToQueue.localBuildingZoneId})
				.mockResolvedValue({data: buildingZone, error: undefined});

			when(buildingService.getBuildingById)
				.calledWith(addToQueue.buildingId as string)
				.mockResolvedValue({data: building, error: undefined});

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
				} as ArgumentMetadata);
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
			} as unknown as BuildingZoneModel;

			const building = {
				id: 'test',
				buildingDetailsAtCertainLevel: [
					{
						level: 10,
					},
				],
			} as BuildingModel;

			when(buildingZoneService.getSingleBuildingZone)
				.calledWith({localBuildingZoneId: addToQueue.localBuildingZoneId})
				.mockResolvedValue({data: buildingZone, error: undefined});

			when(buildingService.getBuildingById)
				.calledWith(addToQueue.buildingId as string)
				.mockResolvedValue({data: building, error: undefined});

			when(eventEmitter.emitAsync).calledWith(
				expect.stringMatching('building_queue.validating.add_to_queue'),
				expect.any(QueueInputValidationEvent),
			);

			await expect(
				addToQueueValidator.transform(addToQueue, {
					metatype: AddToQueueInput,
				} as ArgumentMetadata),
			).resolves.toEqual(addToQueue);
		});
	});
});
