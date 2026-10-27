import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {QueueValidationError} from '@warp-core/user/queue/core';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {ResearchPrerequisitesValidator} from '@warp-core/user/queue/research-queue/input/validator/research-prerequisites.validator';
import {ResearchQueueInputValidation} from '@warp-core/user/queue/research-queue/input/validator/type';

jest.mock('@warp-core/database/repository/habitat-research-node.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Research prerequisites validator', () => {
	let researchPrerequisitesValidator: ResearchPrerequisitesValidator;
	let habitatResearchNodeRepository: jest.Mocked<HabitatResearchNodeRepository>;
	let habitatModel: AuthorizedHabitatModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResearchPrerequisitesValidator,
				HabitatResearchNodeRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		researchPrerequisitesValidator = module.get(ResearchPrerequisitesValidator);
		habitatResearchNodeRepository = module.get(HabitatResearchNodeRepository);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
	});

	function prepareValidationInput(
		endLevel: number,
		currentLevel: number = 0,
	): ResearchQueueInputValidation {
		return {
			addToQueueInput: {
				researchNodeId: 'steel',
				endLevel,
			} as AddResearchToQueueInput,
			researchNode: {
				id: 'steel',
				researchNodeDetailsAtCertainLevel: [
					{
						details: {
							level: 1,
							requirements: [
								{resourceId: 'wood', cost: 10},
								{researchNodeId: 'metallurgy', researchNodeLevel: 1},
							],
						},
					},
					{
						details: {
							level: 2,
							requirements: [
								{researchNodeId: 'metallurgy', researchNodeLevel: 3},
								{researchNodeId: 'chemistry', researchNodeLevel: 1},
							],
						},
					},
				],
			} as unknown as ResearchNodeModel,
			habitatResearchNode:
				currentLevel === 0
					? null
					: ({currentLevel} as HabitatResearchNodeModel),
			validationError: new QueueValidationError(),
		};
	}

	describe('validate', () => {
		it('should not query developed research nodes when levels have no research node requirements', async () => {
			const input = prepareValidationInput(1);
			input.researchNode = {
				researchNodeDetailsAtCertainLevel: [
					{details: {level: 1, requirements: [{resourceId: 'wood', cost: 1}]}},
				],
			} as unknown as ResearchNodeModel;

			await researchPrerequisitesValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(false);
			expect(
				habitatResearchNodeRepository.getForHabitatAndResearchNodes,
			).not.toHaveBeenCalled();
		});

		it('should add error when required research node is not developed', async () => {
			const input = prepareValidationInput(1);
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy'])
				.mockResolvedValueOnce([]);

			await researchPrerequisitesValidator.validate(input);

			expect(input.validationError.getResponse()).toEqual({
				researchNodeId: ['Research node metallurgy at level 1 is required.'],
			});
		});

		it('should not add error when required research node is developed to required level', async () => {
			const input = prepareValidationInput(1);
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy'])
				.mockResolvedValueOnce([
					{researchNodeId: 'metallurgy', currentLevel: 1},
				] as HabitatResearchNodeModel[]);

			await researchPrerequisitesValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(false);
		});

		it('should use highest required level and report every missing research node when upgrading by multiple levels', async () => {
			const input = prepareValidationInput(2);
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy', 'chemistry'])
				.mockResolvedValueOnce([
					{researchNodeId: 'metallurgy', currentLevel: 2},
				] as HabitatResearchNodeModel[]);

			await researchPrerequisitesValidator.validate(input);

			expect(input.validationError.getResponse()).toEqual({
				researchNodeId: [
					'Research node metallurgy at level 3 is required.',
					'Research node chemistry at level 1 is required.',
				],
			});
		});

		it('should skip requirements of already developed levels', async () => {
			const input = prepareValidationInput(2, 1);
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy', 'chemistry'])
				.mockResolvedValueOnce([
					{researchNodeId: 'metallurgy', currentLevel: 3},
					{researchNodeId: 'chemistry', currentLevel: 1},
				] as HabitatResearchNodeModel[]);

			await researchPrerequisitesValidator.validate(input);

			expect(input.validationError.hasErrors()).toBe(false);
		});
	});
});
