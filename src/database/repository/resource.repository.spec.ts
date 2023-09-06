import {Test, TestingModule} from '@nestjs/testing';
import {ResourceRepository} from '@warp-core/database/repository/resource.repository';
import {DataSource} from 'typeorm';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';
jest.mock("../transaction-manager.service");

describe('Resource repository test', () => {
	let resourceRepository: ResourceRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResourceRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager() {},
					},
				},
				TransactionManagerService
			],
		}).compile();

		resourceRepository = module.get<ResourceRepository>(ResourceRepository);
	});

	test('resource repository object should be defined', () => {
		expect(resourceRepository).toBeDefined();
	});
});
