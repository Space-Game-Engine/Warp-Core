import {EntityManager} from 'typeorm';

/**
 * Prepare repository external fields, for example for shared transactions.
 * Example:
 * ```javascript
 * import {YourRepository} from "@warp-core/database/repository/YOUR_REPOSITORY";
 *
 * jest.mock("@warp-core/database/repository/YOUR_REPOSITORY");
 *
 * describe("Testing some service", () => {
 *  let yourRepository: jest.Mocked<YourRepository>;
 *
 *  beforeAll(() => {
 *      prepareRepositoryMock(YourRepository);
 *  });
 *
 *  beforeEach(async () => {
 *         jest.clearAllMocks(); //very important!
 *         const module: TestingModule = await Test.createTestingModule({
 *             providers: [
 *                 ServiceToTest,
 *                 YourRepository,
 *             ]
 *         }).compile();
 *
 *         yourRepository = module.get(YourRepository);
 *     });
 * });
 * ```
 * @param repositoryType
 */
export function prepareRepositoryMock(repositoryType: any) {
	const manager = {
		save: jest.fn(),
		count: jest.fn(),
		create: jest.fn(),
		insert: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		connection: {
			subscribers: [],
		},
	} as any as EntityManager;

	jest
		.spyOn(repositoryType.prototype, 'createSharedTransaction')
		.mockImplementation(async () => {
			return ['123', manager];
		});

	jest
		.spyOn(repositoryType.prototype, 'getSharedTransaction')
		.mockImplementation(() => {
			return manager;
		});

	jest
		.spyOn(repositoryType.prototype, 'commitSharedTransaction')
		.mockImplementation(async (transactionId: string) => {});

	jest
		.spyOn(repositoryType.prototype, 'rollbackSharedTransaction')
		.mockImplementation(async (transactionId: string) => {});

	repositoryType.prototype.__defineGetter__('manager', () => manager);
}
