import {Test, TestingModule} from '@nestjs/testing';

import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {QueueValidationError} from '@warp-core/user/queue/core';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {ResearchEndLevelValidator} from '@warp-core/user/queue/research-queue/input/validator/research-end-level.validator';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

describe('Research end level validator', () => {
	let researchEndLevelValidator: ResearchEndLevelValidator;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [ResearchEndLevelValidator],
		}).compile();

		researchEndLevelValidator = module.get(ResearchEndLevelValidator);
	});

	function prepareValidationInput(
		endLevel: number,
		currentLevel: number | null,
		maxLevel: number | null = 10,
	): ResearchQueueInputValidation {
		return {
			addToQueueInput: {
				researchNodeId: 'basic_research',
				endLevel,
			} as AddResearchToQueueInput,
			researchNode: {
				id: 'basic_research',
				researchNodeDetailsAtCertainLevel:
					maxLevel === null ? [] : [{details: {level: maxLevel}}],
			} as unknown as ResearchNodeModel,
			habitatResearchNode:
				currentLevel === null
					? null
					: ({currentLevel} as HabitatResearchNodeModel),
			validationError: new QueueValidationError(),
		};
	}

	describe('validate', () => {
		it('should add error when end level is lower than current level', async () => {
			const input = prepareValidationInput(1, 5);

			await researchEndLevelValidator.validate(input);

			expect(input.validationError.getResponse()).toEqual({
				endLevel: ['End level should not be lower than existing level.'],
			});
		});

		it('should add error when end level equals current level', async () => {
			const input = prepareValidationInput(5, 5);

			await researchEndLevelValidator.validate(input);

			expect(input.validationError.getResponse()).toEqual({
				endLevel: ['End level should not equal existing level.'],
			});
		});

		it('should add error when research node has no level details', async () => {
			const input = prepareValidationInput(1, null, null);

			await researchEndLevelValidator.validate(input);

			expect(input.validationError.getResponse()).toEqual({
				endLevel: [
					'Last possible update value for research node basic_research does not exists',
				],
			});
		});

		it('should add error when end level is higher than last research node level', async () => {
			const input = prepareValidationInput(11, 5);

			await researchEndLevelValidator.validate(input);

			expect(input.validationError.getResponse()).toEqual({
				endLevel: [
					'You cannot update higher than it is possible. Check research node update details.',
				],
			});
		});

		it('should pass validation when habitat never researched node and end level is in range', async () => {
			const input = prepareValidationInput(1, null);

			await researchEndLevelValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(false);
		});

		it('should pass validation when end level equals last research node level', async () => {
			const input = prepareValidationInput(10, 5);

			await researchEndLevelValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(false);
		});
	});
});
