import {ArgumentMetadata, BadRequestException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';

import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';
import {AddUnitToQueueValidator} from '@warp-core/user/queue/unit-queue/input/validator/add-unit-to-queue.validator';
import {UnitConstructionValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-construction.validator';
import {UnitMaxQueueCountValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-max-queue-count.validator';
import {UnitRequirementsValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-requirements.validator';
import {ValidateSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/input/validator/validate-single-unit-queue-element.service';

jest.mock(
	'@warp-core/user/queue/unit-queue/input/validator/validate-single-unit-queue-element.service',
);
jest.mock(
	'@warp-core/user/queue/unit-queue/input/validator/unit-construction.validator',
);
jest.mock(
	'@warp-core/user/queue/unit-queue/input/validator/unit-max-queue-count.validator',
);
jest.mock(
	'@warp-core/user/queue/unit-queue/input/validator/unit-requirements.validator',
);

describe('Add unit to queue validator', () => {
	let addUnitToQueueValidator: AddUnitToQueueValidator;
	let validateQueueItem: jest.Mocked<ValidateSingleUnitQueueElementService>;
	let constructionValidator: UnitConstructionValidator;
	let maxQueueCountValidator: UnitMaxQueueCountValidator;
	let requirementsValidator: UnitRequirementsValidator;

	const metadata = {
		type: 'body',
		metatype: AddUnitToQueueInput,
	} as ArgumentMetadata;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AddUnitToQueueValidator,
				ValidateSingleUnitQueueElementService,
				UnitConstructionValidator,
				UnitMaxQueueCountValidator,
				UnitRequirementsValidator,
			],
		}).compile();

		addUnitToQueueValidator = module.get(AddUnitToQueueValidator);
		validateQueueItem = module.get(ValidateSingleUnitQueueElementService);
		constructionValidator = module.get(UnitConstructionValidator);
		maxQueueCountValidator = module.get(UnitMaxQueueCountValidator);
		requirementsValidator = module.get(UnitRequirementsValidator);
	});

	describe('transform', () => {
		it('should validate queue item with construction, max queue count and requirements validators when input is valid', async () => {
			const input = {unitId: 'engineer', amount: 2};
			validateQueueItem.validateQueueItem.mockResolvedValueOnce(true);

			expect(await addUnitToQueueValidator.transform(input, metadata)).toBe(
				input,
			);
			expect(validateQueueItem.validateQueueItem).toHaveBeenCalledWith({
				addToQueueInput: expect.objectContaining(input),
				validators: [
					constructionValidator,
					maxQueueCountValidator,
					requirementsValidator,
				],
			});
		});

		it.each([0, -1, 1.5])(
			'should throw bad request exception and skip queue validation when amount is %s',
			async amount => {
				await expect(
					addUnitToQueueValidator.transform(
						{unitId: 'engineer', amount},
						metadata,
					),
				).rejects.toThrow(BadRequestException);
				expect(validateQueueItem.validateQueueItem).not.toHaveBeenCalled();
			},
		);

		it('should rethrow error when queue validation fails', async () => {
			validateQueueItem.validateQueueItem.mockRejectedValueOnce(
				new Error('queue validation failed'),
			);

			await expect(
				addUnitToQueueValidator.transform(
					{unitId: 'engineer', amount: 1},
					metadata,
				),
			).rejects.toThrow('queue validation failed');
		});
	});
});
