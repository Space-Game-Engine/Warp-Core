import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingQueryEmitter} from '@warp-core/global/building';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone';
import {QueueValidationError} from '@warp-core/user/queue/building-queue/exception/queue-validation.error';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {ValidateSingleQueueElementService} from '@warp-core/user/queue/building-queue/input/validator/validate-single-queue-element.service';

jest.mock('@warp-core/global/building/exchange/query/building-query.emitter');
jest.mock('@warp-core/user/building-zone/exchange/query/building-zone.emitter');

describe('Validate single queue element service', () => {
	let validateSingleQueueElementService: ValidateSingleQueueElementService;
	let buildingService: jest.Mocked<BuildingQueryEmitter>;
	let buildingZoneService: jest.Mocked<BuildingZoneEmitter>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueryEmitter,
				BuildingZoneEmitter,
				ValidateSingleQueueElementService,
			],
		}).compile();

		validateSingleQueueElementService = module.get(
			ValidateSingleQueueElementService,
		);
		buildingZoneService = module.get(BuildingZoneEmitter);
		buildingService = module.get(BuildingQueryEmitter);
	});

	describe('validateQueueItem', () => {
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
				await validateSingleQueueElementService.validateQueueItem({
					addToQueueInput: addToQueue,
					validators: [],
				});
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
				await validateSingleQueueElementService.validateQueueItem({
					addToQueueInput: addToQueue,
					validators: [],
				});
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
				await validateSingleQueueElementService.validateQueueItem({
					addToQueueInput: addToQueue,
					validators: [],
				});
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

			try {
				await validateSingleQueueElementService.validateQueueItem({
					addToQueueInput: addToQueue,
					validators: [],
				});
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

			await expect(
				validateSingleQueueElementService.validateQueueItem({
					addToQueueInput: addToQueue,
					validators: [],
				}),
			).resolves.toEqual(true);
		});
	});
});
