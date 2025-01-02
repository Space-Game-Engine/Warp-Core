import {Test, TestingModule} from '@nestjs/testing';
import {DataSource} from 'typeorm';

import {InstallationDetailsRepository} from '@warp-core/database/repository/installation-details.repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';
jest.mock('../transaction-manager.service');

describe('Resource repository test', () => {
	let installationDetailsRepository: InstallationDetailsRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				InstallationDetailsRepository,
				{
					provide: DataSource,
					useValue: {
						createEntityManager: (): void => {},
					},
				},
				TransactionManagerService,
			],
		}).compile();

		installationDetailsRepository = module.get<InstallationDetailsRepository>(
			InstallationDetailsRepository,
		);
	});

	test('Installation details repository object should be defined', () => {
		expect(installationDetailsRepository).toBeDefined();
	});
});
