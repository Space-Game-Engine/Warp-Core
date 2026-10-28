import {Test, TestingModule} from '@nestjs/testing';

import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {BuildingRequirementsValidator} from '@warp-core/user/queue/building-queue/input/validator/building-requirements.validator';
import {QueueInputValidation} from '@warp-core/user/queue/building-queue/input/validator/type';
import {
	QueueValidationError,
	ValidateQueueRequirementsService,
} from '@warp-core/user/queue/core';

jest.mock(
	'@warp-core/user/queue/core/input/validator/validate-queue-requirements.service',
);

describe('Building requirements validator', () => {
	let buildingRequirementsValidator: BuildingRequirementsValidator;
	let validateQueueRequirementsService: jest.Mocked<ValidateQueueRequirementsService>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingRequirementsValidator,
				ValidateQueueRequirementsService,
			],
		}).compile();

		buildingRequirementsValidator = module.get(BuildingRequirementsValidator);
		validateQueueRequirementsService = module.get(
			ValidateQueueRequirementsService,
		);
	});

	describe('validate', () => {
		it('should validate requirements of building levels between building zone level and end level', async () => {
			const levelDetails = [{level: 1}, {level: 2}];
			const input = {
				addToQueueInput: {endLevel: 2} as AddToQueueInput,
				buildingZone: {level: 1} as BuildingZoneModel,
				building: {
					buildingDetailsAtCertainLevel: levelDetails.map(details => ({
						details,
					})),
				} as unknown as BuildingModel,
				validationError: new QueueValidationError(),
			} as QueueInputValidation;

			await buildingRequirementsValidator.validate(input);

			expect(validateQueueRequirementsService.validate).toHaveBeenCalledWith(
				levelDetails,
				1,
				2,
				input.validationError,
			);
		});
	});
});
