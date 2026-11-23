import {Test, TestingModule} from '@nestjs/testing';

import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {
	QueueValidationError,
	ValidateBuildingRequirementsService,
	ValidateResearchNodeRequirementsService,
} from '@warp-core/user/queue/core';
import {UnitQueueInputValidation} from '@warp-core/user/queue/unit-queue/input/validator/type';
import {UnitRequirementsValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-requirements.validator';

jest.mock(
	'@warp-core/user/queue/core/input/validator/validate-research-node-requirements.service',
);
jest.mock(
	'@warp-core/user/queue/core/input/validator/validate-building-requirements.service',
);

describe('Unit requirements validator', () => {
	let unitRequirementsValidator: UnitRequirementsValidator;
	let validateResearchNodeRequirementsService: jest.Mocked<ValidateResearchNodeRequirementsService>;
	let validateBuildingRequirementsService: jest.Mocked<ValidateBuildingRequirementsService>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UnitRequirementsValidator,
				ValidateResearchNodeRequirementsService,
				ValidateBuildingRequirementsService,
			],
		}).compile();

		unitRequirementsValidator = module.get(UnitRequirementsValidator);
		validateResearchNodeRequirementsService = module.get(
			ValidateResearchNodeRequirementsService,
		);
		validateBuildingRequirementsService = module.get(
			ValidateBuildingRequirementsService,
		);
	});

	describe('validate', () => {
		it('should validate research node and building requirements of the unit', async () => {
			const requirements = [
				{buildingId: 'train_factory', buildingLevel: 1},
			] as RequirementsPerLevelModel[];
			const validationError = new QueueValidationError();

			await unitRequirementsValidator.validate({
				unit: {requirements} as UnitBlueprintGlobalModel,
				validationError,
			} as UnitQueueInputValidation);

			expect(
				validateResearchNodeRequirementsService.validate,
			).toHaveBeenCalledWith(requirements, validationError);
			expect(validateBuildingRequirementsService.validate).toHaveBeenCalledWith(
				requirements,
				validationError,
			);
		});

		it('should validate empty requirements when unit does not have requirements', async () => {
			const validationError = new QueueValidationError();

			await unitRequirementsValidator.validate({
				unit: {requirements: null} as UnitBlueprintGlobalModel,
				validationError,
			} as UnitQueueInputValidation);

			expect(validateBuildingRequirementsService.validate).toHaveBeenCalledWith(
				[],
				validationError,
			);
		});
	});
});
