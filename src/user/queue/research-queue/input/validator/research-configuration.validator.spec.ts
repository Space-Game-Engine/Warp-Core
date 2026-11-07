import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {QueueValidationError} from '@warp-core/user/queue/core';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {ResearchConfigurationValidator} from '@warp-core/user/queue/research-queue/input/validator/research-configuration.validator';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

jest.mock('@warp-core/database/repository/research-queue.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Research configuration validator', () => {
	let researchConfigurationValidator: ResearchConfigurationValidator;
	let researchQueueRepository: jest.Mocked<ResearchQueueRepository>;
	let runtimeConfig: RuntimeConfig;
	let habitatModel: AuthorizedHabitatModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResearchConfigurationValidator,
				ResearchQueueRepository,
				AuthorizedHabitatModel,
				coreConfigMock,
			],
		}).compile();

		researchConfigurationValidator = module.get(ResearchConfigurationValidator);
		researchQueueRepository = module.get(ResearchQueueRepository);
		runtimeConfig = module.get(RuntimeConfig);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
	});

	function prepareValidationInput(
		endLevel: number,
		currentLevel: number | null,
	): ResearchQueueInputValidation {
		return {
			addToQueueInput: {
				researchNodeId: 'basic_research',
				endLevel,
			} as AddResearchToQueueInput,
			habitatResearchNode:
				currentLevel === null
					? null
					: ({currentLevel} as HabitatResearchNodeModel),
			validationError: new QueueValidationError(),
		} as ResearchQueueInputValidation;
	}

	describe('validate', () => {
		describe('when multiple level update is allowed', () => {
			beforeEach(() => {
				runtimeConfig.habitat.researchQueue.allowMultipleLevelUpdate = true;
			});

			it('should pass validation when there is no queue for research node', async () => {
				const input = prepareValidationInput(5, null);
				when(researchQueueRepository.getCurrentResearchQueueForResearchNode)
					.expectCalledWith('basic_research', 5)
					.mockResolvedValueOnce([]);

				await researchConfigurationValidator.validate(input);

				expect(input.validationError.hasErrors()).toBe(false);
			});

			it('should pass validation when end level is higher than last queued level', async () => {
				const input = prepareValidationInput(5, null);
				when(researchQueueRepository.getCurrentResearchQueueForResearchNode)
					.expectCalledWith('basic_research', 5)
					.mockResolvedValueOnce([
						{endLevel: 2},
						{endLevel: 4},
					] as ResearchQueueElementModel[]);

				await researchConfigurationValidator.validate(input);

				expect(input.validationError.hasErrors()).toBe(false);
			});

			it('should add error when end level is not higher than last queued level', async () => {
				const input = prepareValidationInput(4, null);
				when(researchQueueRepository.getCurrentResearchQueueForResearchNode)
					.expectCalledWith('basic_research', 5)
					.mockResolvedValueOnce([
						{endLevel: 2},
						{endLevel: 4},
					] as ResearchQueueElementModel[]);

				await researchConfigurationValidator.validate(input);

				expect(input.validationError.getResponse()).toEqual({
					endLevel: [
						'New queue element should have end level higher than last queue element',
					],
				});
			});
		});

		describe('when multiple level update is not allowed', () => {
			beforeEach(() => {
				runtimeConfig.habitat.researchQueue.allowMultipleLevelUpdate = false;
			});

			it('should pass validation when habitat never researched node and end level is 1', async () => {
				const input = prepareValidationInput(1, null);

				await researchConfigurationValidator.validate(input);

				expect(input.validationError.hasErrors()).toBe(false);
				expect(
					researchQueueRepository.getCurrentResearchQueueForResearchNode,
				).not.toHaveBeenCalled();
			});

			it('should pass validation when end level is one above current level', async () => {
				const input = prepareValidationInput(3, 2);

				await researchConfigurationValidator.validate(input);

				expect(input.validationError.hasErrors()).toBe(false);
			});

			it('should add error when end level is more than one above current level', async () => {
				const input = prepareValidationInput(4, 2);

				await researchConfigurationValidator.validate(input);

				expect(input.validationError.getResponse()).toEqual({
					endLevel: [
						'You can only upgrade a research node by one level at a time',
					],
				});
			});
		});
	});
});
