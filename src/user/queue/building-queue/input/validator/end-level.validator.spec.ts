import {Test, TestingModule} from '@nestjs/testing';

import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {QueueValidationError} from '@warp-core/user/queue/building-queue/exception/queue-validation.error';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {EndLevelValidator} from '@warp-core/user/queue/building-queue/input/validator/end-level.validator';
import {QueueInputValidation} from '@warp-core/user/queue/building-queue/input/validator/type';

describe('End Level building queue validator', () => {
	let endLevelValidator: EndLevelValidator;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [EndLevelValidator],
		}).compile();

		endLevelValidator = module.get(EndLevelValidator);
	});

	describe('validate', () => {
		it('should add error to event when building zone level is higher than add to queue input level', async () => {
			const addToQueueInput: AddToQueueInput = {
				localBuildingZoneId: 1,
				buildingId: 'test',
				endLevel: 1,
			};

			const buildingZone = {
				id: 1,
				level: 10,
				building: null,
			} as unknown as BuildingZoneModel;

			const building = {
				id: 'test',
			} as BuildingModel;

			const validationError = new QueueValidationError();

			const queueValidationInput: QueueInputValidation = {
				addToQueueInput,
				building,
				buildingZone,
				validationError,
			};
			await endLevelValidator.validate(queueValidationInput);

			expect(validationError.hasErrors()).toBe(true);
			expect(validationError.getResponse()).toEqual({
				endLevel: ['End level should not be lower than existing level.'],
			});
		});

		it('should add error to event when building zone level equals queue end level', async () => {
			const addToQueueInput: AddToQueueInput = {
				localBuildingZoneId: 1,
				buildingId: 'test',
				endLevel: 10,
			};

			const buildingZone = {
				id: 1,
				level: 10,
				building: null,
			} as unknown as BuildingZoneModel;

			const building = {
				id: 'test',
			} as BuildingModel;

			const validationError = new QueueValidationError();

			const queueValidationInput: QueueInputValidation = {
				addToQueueInput,
				building,
				buildingZone,
				validationError,
			};
			await endLevelValidator.validate(queueValidationInput);

			expect(validationError.hasErrors()).toBe(true);
			expect(validationError.getResponse()).toEqual({
				endLevel: ['End level should not equal existing level.'],
			});
		});

		it('should add error to event when add to queue level is higher than possible to update', async () => {
			const addToQueueInput: AddToQueueInput = {
				localBuildingZoneId: 1,
				buildingId: 'test',
				endLevel: 100,
			};

			const buildingZone = {
				id: 1,
				level: 10,
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

			const validationError = new QueueValidationError();

			const queueValidationInput: QueueInputValidation = {
				addToQueueInput,
				building,
				buildingZone,
				validationError,
			};
			await endLevelValidator.validate(queueValidationInput);

			expect(validationError.hasErrors()).toBe(true);
			expect(validationError.getResponse()).toEqual({
				endLevel: [
					'You cannot update higher than it is possible. Check Building update details.',
				],
			});
		});

		it('should be correct level settings for queue', async () => {
			const addToQueueInput: AddToQueueInput = {
				localBuildingZoneId: 1,
				buildingId: 'test',
				endLevel: 10,
			};

			const buildingZone = {
				id: 1,
				level: 1,
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

			const validationError = new QueueValidationError();

			const queueValidationInput: QueueInputValidation = {
				addToQueueInput,
				building,
				buildingZone,
				validationError,
			};
			await endLevelValidator.validate(queueValidationInput);

			expect(validationError.hasErrors()).toBe(false);
		});
	});
});
