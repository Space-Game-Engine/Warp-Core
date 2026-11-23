import {ArgumentMetadata, BadRequestException} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';

import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';
import {DraftUnitQueueElementValidator} from '@warp-core/user/queue/unit-queue/input/validator/draft-unit-queue-element.validator';
import {UnitConstructionValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-construction.validator';
import {UnitRequirementsValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-requirements.validator';
import {ValidateSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/input/validator/validate-single-unit-queue-element.service';

jest.mock(
	'@warp-core/user/queue/unit-queue/input/validator/validate-single-unit-queue-element.service',
);
jest.mock(
	'@warp-core/user/queue/unit-queue/input/validator/unit-construction.validator',
);
jest.mock(
	'@warp-core/user/queue/unit-queue/input/validator/unit-requirements.validator',
);

describe('Draft unit queue element validator', () => {
	let draftUnitQueueElementValidator: DraftUnitQueueElementValidator;
	let validateQueueItem: jest.Mocked<ValidateSingleUnitQueueElementService>;
	let constructionValidator: UnitConstructionValidator;
	let requirementsValidator: UnitRequirementsValidator;

	const metadata = {
		type: 'body',
		metatype: AddUnitToQueueInput,
	} as ArgumentMetadata;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DraftUnitQueueElementValidator,
				ValidateSingleUnitQueueElementService,
				UnitConstructionValidator,
				UnitRequirementsValidator,
			],
		}).compile();

		draftUnitQueueElementValidator = module.get(DraftUnitQueueElementValidator);
		validateQueueItem = module.get(ValidateSingleUnitQueueElementService);
		constructionValidator = module.get(UnitConstructionValidator);
		requirementsValidator = module.get(UnitRequirementsValidator);
	});

	describe('transform', () => {
		it('should validate queue item without max queue count validator when input is valid', async () => {
			const input = {unitId: 'engineer', amount: 2};
			validateQueueItem.validateQueueItem.mockResolvedValueOnce(true);

			expect(
				await draftUnitQueueElementValidator.transform(input, metadata),
			).toBe(input);
			expect(validateQueueItem.validateQueueItem).toHaveBeenCalledWith({
				addToQueueInput: expect.objectContaining(input),
				validators: [constructionValidator, requirementsValidator],
			});
		});

		it('should throw bad request exception and skip queue validation when input is invalid', async () => {
			await expect(
				draftUnitQueueElementValidator.transform(
					{unitId: 'engineer', amount: 0},
					metadata,
				),
			).rejects.toThrow(BadRequestException);
			expect(validateQueueItem.validateQueueItem).not.toHaveBeenCalled();
		});
	});
});
