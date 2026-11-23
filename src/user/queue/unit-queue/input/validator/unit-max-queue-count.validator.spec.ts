import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {UnitQueueRepository} from '@warp-core/database/repository/unit-queue.repository';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {QueueValidationError} from '@warp-core/user/queue/core';
import {UnitQueueInputValidation} from '@warp-core/user/queue/unit-queue/input/validator/type';
import {UnitMaxQueueCountValidator} from '@warp-core/user/queue/unit-queue/input/validator/unit-max-queue-count.validator';

jest.mock('@warp-core/database/repository/unit-queue.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Unit max queue count validator', () => {
	let unitMaxQueueCountValidator: UnitMaxQueueCountValidator;
	let unitQueueRepository: jest.Mocked<UnitQueueRepository>;
	let runtimeConfig: RuntimeConfig;
	let habitatModel: AuthorizedHabitatModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UnitMaxQueueCountValidator,
				UnitQueueRepository,
				AuthorizedHabitatModel,
				coreConfigMock,
			],
		}).compile();

		unitMaxQueueCountValidator = module.get(UnitMaxQueueCountValidator);
		unitQueueRepository = module.get(UnitQueueRepository);
		runtimeConfig = module.get(RuntimeConfig);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
		runtimeConfig.habitat.unitQueue.maxElementsInQueue = 3;
	});

	const testCases = [
		{
			name: 'queue count is below max elements',
			queueCount: 2,
			hasErrors: false,
		},
		{name: 'queue count equals max elements', queueCount: 3, hasErrors: true},
		{name: 'queue count is above max elements', queueCount: 4, hasErrors: true},
	];

	describe.each(testCases)('validate', singleTestCase => {
		it(`should ${singleTestCase.hasErrors ? 'add error' : 'pass validation'} when ${singleTestCase.name}`, async () => {
			const input = {
				validationError: new QueueValidationError(),
			} as UnitQueueInputValidation;

			when(unitQueueRepository.countActiveQueueElementsForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce(singleTestCase.queueCount);

			await unitMaxQueueCountValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(singleTestCase.hasErrors);
			if (singleTestCase.hasErrors) {
				expect(input.validationError.getResponse()).toEqual({
					queueInput: ['Max queue count (3) has been reached'],
				});
			}
		});
	});
});
