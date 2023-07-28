import {Test, TestingModule} from '@nestjs/testing';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {DataSource} from 'typeorm';

describe('Habitat resource repository test', () => {
	let habitatResourceRepository: HabitatResourceRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				HabitatResourceRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager() {},
					},
				},
			],
		}).compile();

		habitatResourceRepository = module.get<HabitatResourceRepository>(
			HabitatResourceRepository,
		);
	});

	test('habitat resource repository object should be defined', () => {
		expect(habitatResourceRepository).toBeDefined();
	});
});
