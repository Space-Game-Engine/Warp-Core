import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {QueueValidationError} from '@warp-core/user/queue/core/exception/queue-validation.error';
import {ValidateQueueRequirementsService} from '@warp-core/user/queue/core/input/validator/validate-queue-requirements.service';

jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock('@warp-core/database/repository/habitat-research-node.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Validate queue requirements service', () => {
	let validateQueueRequirementsService: ValidateQueueRequirementsService;
	let habitatResearchNodeRepository: jest.Mocked<HabitatResearchNodeRepository>;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let habitatModel: AuthorizedHabitatModel;
	let validationError: QueueValidationError;

	const levelDetails = [
		{
			level: 1,
			requirements: [
				{resourceId: 'wood', cost: 10},
				{researchNodeId: 'metallurgy', researchNodeLevel: 1},
			],
		},
		{
			level: 2,
			requirements: [
				{researchNodeId: 'metallurgy', researchNodeLevel: 3},
				{researchNodeId: 'chemistry', researchNodeLevel: 1},
			],
		},
	] as unknown as DetailsAtCertainLevelModel[];

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ValidateQueueRequirementsService,
				HabitatResearchNodeRepository,
				BuildingZoneRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		validateQueueRequirementsService = module.get(
			ValidateQueueRequirementsService,
		);
		habitatResearchNodeRepository = module.get(HabitatResearchNodeRepository);
		buildingZoneRepository = module.get(BuildingZoneRepository);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
		validationError = new QueueValidationError();
	});

	describe('validate', () => {
		it('should not query developed research nodes when levels have no research node requirements', async () => {
			await validateQueueRequirementsService.validate(
				[
					{level: 1, requirements: [{resourceId: 'wood', cost: 1}]},
				] as unknown as DetailsAtCertainLevelModel[],
				0,
				1,
				validationError,
			);

			expect(validationError.hasErrors()).toBe(false);
			expect(
				habitatResearchNodeRepository.getForHabitatAndResearchNodes,
			).not.toHaveBeenCalled();
			expect(
				buildingZoneRepository.getBuildingZonesForHabitatAndBuildings,
			).not.toHaveBeenCalled();
		});

		it('should add error when required research node is not developed', async () => {
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy'])
				.mockResolvedValueOnce([]);

			await validateQueueRequirementsService.validate(
				levelDetails,
				0,
				1,
				validationError,
			);

			expect(validationError.getResponse()).toEqual({
				requirements: ['Research node metallurgy at level 1 is required.'],
			});
		});

		it('should not add error when required research node is developed to required level', async () => {
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy'])
				.mockResolvedValueOnce([
					{researchNodeId: 'metallurgy', currentLevel: 1},
				] as HabitatResearchNodeModel[]);

			await validateQueueRequirementsService.validate(
				levelDetails,
				0,
				1,
				validationError,
			);

			expect(validationError.hasErrors()).toBe(false);
		});

		it('should use highest required level and report every missing research node when upgrading by multiple levels', async () => {
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy', 'chemistry'])
				.mockResolvedValueOnce([
					{researchNodeId: 'metallurgy', currentLevel: 2},
				] as HabitatResearchNodeModel[]);

			await validateQueueRequirementsService.validate(
				levelDetails,
				0,
				2,
				validationError,
			);

			expect(validationError.getResponse()).toEqual({
				requirements: [
					'Research node metallurgy at level 3 is required.',
					'Research node chemistry at level 1 is required.',
				],
			});
		});

		it('should skip requirements of levels up to start level when start level is above zero', async () => {
			when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
				.expectCalledWith(5, ['metallurgy', 'chemistry'])
				.mockResolvedValueOnce([
					{researchNodeId: 'metallurgy', currentLevel: 3},
					{researchNodeId: 'chemistry', currentLevel: 1},
				] as HabitatResearchNodeModel[]);

			await validateQueueRequirementsService.validate(
				levelDetails,
				1,
				2,
				validationError,
			);

			expect(validationError.hasErrors()).toBe(false);
		});

		describe('building requirements', () => {
			const buildingLevelDetails = [
				{
					level: 1,
					requirements: [{buildingId: 'university', buildingLevel: 1}],
				},
				{
					level: 2,
					requirements: [
						{buildingId: 'university', buildingLevel: 3},
						{buildingId: 'coal_mine', buildingLevel: 2},
					],
				},
			] as unknown as DetailsAtCertainLevelModel[];

			it('should add error when required building is not built', async () => {
				when(buildingZoneRepository.getBuildingZonesForHabitatAndBuildings)
					.expectCalledWith(5, ['university'])
					.mockResolvedValueOnce([]);

				await validateQueueRequirementsService.validate(
					buildingLevelDetails,
					0,
					1,
					validationError,
				);

				expect(validationError.getResponse()).toEqual({
					requirements: ['Building university at level 1 is required.'],
				});
				expect(
					habitatResearchNodeRepository.getForHabitatAndResearchNodes,
				).not.toHaveBeenCalled();
			});

			it('should not add error when required building is built to required level', async () => {
				when(buildingZoneRepository.getBuildingZonesForHabitatAndBuildings)
					.expectCalledWith(5, ['university'])
					.mockResolvedValueOnce([
						{buildingId: 'university', level: 1},
					] as BuildingZoneModel[]);

				await validateQueueRequirementsService.validate(
					buildingLevelDetails,
					0,
					1,
					validationError,
				);

				expect(validationError.hasErrors()).toBe(false);
			});

			it('should use highest built level and report every missing building when upgrading by multiple levels', async () => {
				when(buildingZoneRepository.getBuildingZonesForHabitatAndBuildings)
					.expectCalledWith(5, ['university', 'coal_mine'])
					.mockResolvedValueOnce([
						{buildingId: 'university', level: 1},
						{buildingId: 'university', level: 3},
						{buildingId: 'coal_mine', level: 1},
					] as BuildingZoneModel[]);

				await validateQueueRequirementsService.validate(
					buildingLevelDetails,
					0,
					2,
					validationError,
				);

				expect(validationError.getResponse()).toEqual({
					requirements: ['Building coal_mine at level 2 is required.'],
				});
			});

			it('should report both research node and building errors when both are missing', async () => {
				when(habitatResearchNodeRepository.getForHabitatAndResearchNodes)
					.expectCalledWith(5, ['metallurgy'])
					.mockResolvedValueOnce([]);
				when(buildingZoneRepository.getBuildingZonesForHabitatAndBuildings)
					.expectCalledWith(5, ['university'])
					.mockResolvedValueOnce([]);

				await validateQueueRequirementsService.validate(
					[
						{
							level: 1,
							requirements: [
								{researchNodeId: 'metallurgy', researchNodeLevel: 1},
								{buildingId: 'university', buildingLevel: 1},
							],
						},
					] as unknown as DetailsAtCertainLevelModel[],
					0,
					1,
					validationError,
				);

				expect(validationError.getResponse()).toEqual({
					requirements: [
						'Research node metallurgy at level 1 is required.',
						'Building university at level 1 is required.',
					],
				});
			});
		});
	});
});
