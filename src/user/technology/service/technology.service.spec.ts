import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {TechnologyService} from '@warp-core/user/technology/service/technology.service';

jest.mock('@warp-core/database/repository/habitat-research-node.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Technology service', () => {
	let technologyService: TechnologyService;
	let habitatResearchNodeRepository: jest.Mocked<HabitatResearchNodeRepository>;
	let habitatModel: AuthorizedHabitatModel;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TechnologyService,
				HabitatResearchNodeRepository,
				AuthorizedHabitatModel,
			],
		}).compile();

		technologyService = module.get(TechnologyService);
		habitatResearchNodeRepository = module.get(HabitatResearchNodeRepository);
		habitatModel = module.get(AuthorizedHabitatModel);
	});

	describe('getTechnologiesForLoggedIn', () => {
		it('should return developed research nodes for logged in habitat', async () => {
			const technologies = [
				{researchNodeId: 'basic_research', currentLevel: 1},
			] as HabitatResearchNodeModel[];
			habitatModel.id = 5;

			when(habitatResearchNodeRepository.getAllForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce(technologies);

			expect(await technologyService.getTechnologiesForLoggedIn()).toEqual(
				technologies,
			);
		});
	});
});
