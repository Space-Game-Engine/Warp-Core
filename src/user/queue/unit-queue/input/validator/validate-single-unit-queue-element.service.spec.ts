import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitQueryEmitter} from '@warp-core/global/unit';
import {
	QueueItemValidatorInterface,
	QueueValidationError,
} from '@warp-core/user/queue/core';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';
import {UnitQueueInputValidation} from '@warp-core/user/queue/unit-queue/input/validator/type';
import {ValidateSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/input/validator/validate-single-unit-queue-element.service';

jest.mock('@warp-core/global/unit/exchange/query/unit-query.emitter');

describe('Validate single unit queue element service', () => {
	let validateSingleUnitQueueElementService: ValidateSingleUnitQueueElementService;
	let unitQueryEmitter: jest.Mocked<UnitQueryEmitter>;

	const addToQueueInput = {
		unitId: 'engineer',
		amount: 1,
	} as AddUnitToQueueInput;
	const unit = {id: 'engineer'} as UnitBlueprintGlobalModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [ValidateSingleUnitQueueElementService, UnitQueryEmitter],
		}).compile();

		validateSingleUnitQueueElementService = module.get(
			ValidateSingleUnitQueueElementService,
		);
		unitQueryEmitter = module.get(UnitQueryEmitter);
	});

	describe('validateQueueItem', () => {
		it('should throw validation error when unit does not exist', async () => {
			const validator = {validate: jest.fn()};
			when(unitQueryEmitter.getUnitById)
				.expectCalledWith('engineer')
				.mockResolvedValueOnce({data: null, error: undefined});

			const result = validateSingleUnitQueueElementService.validateQueueItem({
				addToQueueInput,
				validators: [validator],
			});

			await expect(result).rejects.toBeInstanceOf(QueueValidationError);
			await expect(result).rejects.toMatchObject({
				validationError: {unitId: ['Provided unit does not exist.']},
			});
			expect(validator.validate).not.toHaveBeenCalled();
		});

		it('should run every validator with built validation context when unit exists', async () => {
			const firstValidator = {validate: jest.fn()};
			const secondValidator = {validate: jest.fn()};
			when(unitQueryEmitter.getUnitById)
				.expectCalledWith('engineer')
				.mockResolvedValueOnce({data: unit, error: undefined});

			await expect(
				validateSingleUnitQueueElementService.validateQueueItem({
					addToQueueInput,
					validators: [firstValidator, secondValidator],
				}),
			).resolves.toBe(true);

			const expectedContext = {
				addToQueueInput,
				unit,
				validationError: expect.any(QueueValidationError),
			};
			expect(firstValidator.validate).toHaveBeenCalledWith(expectedContext);
			expect(secondValidator.validate).toHaveBeenCalledWith(expectedContext);
		});

		it('should throw validation error when any validator adds error', async () => {
			const failingValidator: QueueItemValidatorInterface<UnitQueueInputValidation> =
				{
					validate: async ({validationError}): Promise<void> => {
						validationError.addError('amount', 'test error');
					},
				};
			when(unitQueryEmitter.getUnitById)
				.expectCalledWith('engineer')
				.mockResolvedValueOnce({data: unit, error: undefined});

			const result = validateSingleUnitQueueElementService.validateQueueItem({
				addToQueueInput,
				validators: [failingValidator],
			});

			await expect(result).rejects.toBeInstanceOf(QueueValidationError);
			await expect(result).rejects.toMatchObject({
				validationError: {amount: ['test error']},
			});
		});
	});
});
