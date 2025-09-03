import {EntityManager} from 'typeorm';

/**
 * Prepare repository external fields.
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
export function prepareRepositoryMock(repositoryType: any): void { // eslint-disable-line
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
	} as unknown as EntityManager;

	repositoryType.prototype.__defineGetter__('manager', () => manager);
}
