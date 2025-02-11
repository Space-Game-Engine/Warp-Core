import {Test, TestingModule} from '@nestjs/testing';
import {DataSource} from 'typeorm';

import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';
jest.mock('../transaction-manager.service');

describe('Habitat resource repository test', () => {
	let habitatResourceRepository: HabitatResourceRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				HabitatResourceRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager: (): void => {},
					},
				},
				TransactionManagerService,
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
