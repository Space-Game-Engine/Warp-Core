import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {QueueValidationError} from '@warp-core/user/queue/core';
import {ResearchMaxQueueCountValidator} from '@warp-core/user/queue/research-queue/input/validator/research-max-queue-count.validator';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

jest.mock('@warp-core/database/repository/research-queue.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Research max queue count validator', () => {
	let researchMaxQueueCountValidator: ResearchMaxQueueCountValidator;
	let researchQueueRepository: jest.Mocked<ResearchQueueRepository>;
	let runtimeConfig: RuntimeConfig;
	let habitatModel: AuthorizedHabitatModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResearchMaxQueueCountValidator,
				ResearchQueueRepository,
				AuthorizedHabitatModel,
				coreConfigMock,
			],
		}).compile();

		researchMaxQueueCountValidator = module.get(ResearchMaxQueueCountValidator);
		researchQueueRepository = module.get(ResearchQueueRepository);
		runtimeConfig = module.get(RuntimeConfig);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
		runtimeConfig.habitat.researchQueue.maxElementsInQueue = 3;
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
			} as ResearchQueueInputValidation;

			when(researchQueueRepository.countActiveQueueElementsForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce(singleTestCase.queueCount);

			await researchMaxQueueCountValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(singleTestCase.hasErrors);
			if (singleTestCase.hasErrors) {
				expect(input.validationError.getResponse()).toEqual({
					queueInput: ['Max queue count (3) has been reached'],
				});
			}
		});
	});
});
