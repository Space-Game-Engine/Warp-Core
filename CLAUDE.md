# CLAUDE.md

Guidance for agents working in Warp-Core. Follow the patterns below. **Reuse the existing abstractions. Don't invent parallel solutions.** If something doesn't fit, ask before introducing a new pattern.

## Project

Game backend built with **NestJS** + **GraphQL code-first** (Apollo).
- **TypeORM** for persistence.
- Communication between modules goes through a custom **internal exchange** built on EventEmitter2.
- **luxon** for dates, **node-config** (YAML in `config/`) for settings, **nestjs-cls** for request context.

**The project is database-agnostic.** sqlite is only for local development and e2e tests. Never use engine-specific SQL, column types or features. Use the TypeORM API (`find*`, operators, `createQueryBuilder` with parameters).

## Commands

```bash
npm run start:dev     # run app (watch)
npm run build
npm run lint          # eslint --fix
npm run format        # prettier on src/ and test/
npm run test          # unit + e2e (jest projects), --runInBand --forceExit
npm run test:unit     # only src/**/*.spec.ts
npm run test:e2e      # only test/e2e/**/*.spec.ts
npm run test:cov
npm run install-game  # seed DB from install YAML files

npx jest --selectProjects unit src/path/to/file.spec.ts   # single unit spec
npx jest --selectProjects e2e test/e2e/feature/x.spec.ts  # single e2e spec
```

## Layout

```
src/
  app.module.ts   root wiring (Config, InternalExchange, Cls, EventEmitter, TypeORM, GraphQL, feature modules)
  auth/           JWT/local auth, global GqlAuthGuard, AuthorizedHabitatModel (CLS proxy)
  core/           config (RuntimeConfig, config models), install, validation, utils/
                  utils/internal-exchange, utils/mechanics, utils/model (*.model-interface.ts), *.util.ts
  database/       ALL entities (model/), ALL repositories (repository/), TransactionManagerService
  global/         game-wide data, not user-specific (building, research-node)
  user/           per-habitat features (habitat, building-zone, resources, queue)
test/
  e2e/            e2e specs grouped by feature + utils/ + test-install-files/
  database/, core-config-mock.ts, expect-extend/   shared test helpers
```

- One Nest module per feature. Aggregator modules (`GlobalModule`, `UserModule`, `QueueModule`) only import their children.
- `src/user/queue/core/` is **not** a Nest module. It is a library of abstract classes that concrete queues extend.
- A feature's `index.ts` barrel exposes its **public API, which is its `exchange/`** (`export * from './exchange';`).
- Always import through the alias `@warp-core/*` (→ `src/*`), and `@warp-core/test/*` (→ `test/*`) in tests. Don't use relative imports.

## Global and shared modules

- `InternalExchangeModule` is `@Global()`. `InternalExchangeEmitter` is injectable everywhere.
- `ConfigModule` (`isGlobal`) and `ClsModule` are global. `AuthorizedHabitatModel` is a global CLS proxy: inject it to get the current habitat/user. Don't pass the habitat through parameters from the resolver.
- **`DatabaseModule` is NOT global.** Every feature module that needs repositories adds `DatabaseModule` to its `imports`.
- `CoreConfigModule` must be imported explicitly to inject `RuntimeConfig` (typed runtime game config, e.g. `runtimeConfig.habitat.buildingQueue.maxElementsInQueue`).

Typical feature module:

```ts
@Module({
	providers: [
		BuildingQueryEmitter,          // foreign emitters this module talks to
		BuildingZoneEmitter,
		BuildingQueueAddService,       // own services, resolver, validators, own emitters
		BuildingQueueResolver,
		BuildingQueueAddEmitter,
		RegisterMechanic.forFeature(BuildingQueueResourceConsumerInterface, 'runtime.mechanics.queue.building.resourceConsumer'),
	],
	imports: [DatabaseModule, CoreConfigModule, AuthModule],
	exports: [BuildingQueueHandlerService],
})
export class BuildingQueueModule {}
```

## Database

### Entities
- **All entities live in `src/database/model/**/<name>.model.ts`**, never inside feature modules. The class name is `XxxModel`.
- One class is the TypeORM `@Entity`, the GraphQL `@ObjectType`, and carries class-validator decorators.
- Every `@Field` / `@ObjectType` has a `description`.
- Relations are **lazy** (`{lazy: true}`), typed `T | Promise<T>`, and read with `await`. Every relation has an explicit FK `@Column` next to it.
- Shared contracts for entities live in `src/core/utils/model/*.model-interface.ts` (e.g. `QueueElementModelInterface`).
- Register each new model in `DatabaseModule.entities()`.

### Repositories
Always extend the base classes in `src/database/repository/`:
- `AbstractRepository<T>` (extends TypeORM `Repository<T>` and adds shared transactions)
- `AbstractQueueElementRepository<T>` for anything queueable

**Never:**
- use `@InjectRepository`
- create a raw `EntityManager`/`QueryRunner`
- write a custom transaction helper
- query the DB outside a repository

Repository methods have descriptive names (`getSingleBuildingQueueElementById`, `getUnresolvedQueueForSingleBuildingZone`). Add JSDoc on abstract/contract methods.

Plain repository:

```ts
import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {AbstractRepository} from '@warp-core/database/repository/abstract.repository';

@Injectable()
export class HabitatRepository extends AbstractRepository<HabitatModel> {
	constructor(private dataSource: DataSource) {
		super(HabitatModel, dataSource.createEntityManager());
	}

	public getHabitatsByUserId(userId: number): Promise<HabitatModel[]> {
		return this.find({where: {userId: userId}});
	}
}
```

Queue repository: implement the abstract contract and reuse the inherited `saveQueueElement` / `markElementAsConsumed`:

```ts
@Injectable()
export class BuildingQueueRepository extends AbstractQueueElementRepository<BuildingQueueElementModel> {
	constructor(private dataSource: DataSource) {
		super(BuildingQueueElementModel, dataSource.createEntityManager());
	}

	public getCurrentQueueForHabitat(habitatId: number): Promise<BuildingQueueElementModel[]> {
		return this.find({
			where: {buildingZone: {habitatId: habitatId}, endTime: MoreThanOrEqual(new Date())},
		});
	}

	public countActiveQueueElementsForHabitat(habitatId: number): Promise<number> {
		return this.count({
			where: {buildingZone: {habitatId: habitatId}, endTime: MoreThanOrEqual(new Date())},
		});
	}

	public getUnresolvedQueueForHabitat(habitatId: number): Promise<BuildingQueueElementModel[]> {
		return this.findBy({
			isConsumed: false,
			endTime: LessThanOrEqual(new Date()),
			buildingZone: {habitatId: habitatId},
		});
	}

	// complex queries: createQueryBuilder with named parameters (DB-agnostic)
	public getUnresolvedQueueForSingleBuildingZone(buildingZoneId: number): Promise<BuildingQueueElementModel[]> {
		return this.createQueryBuilder('buildingQueue')
			.where('buildingQueue.isConsumed = false')
			.andWhere('endTime <= :date', {date: new Date()})
			.andWhere('buildingQueue.buildingZoneId = :buildingZoneId', {buildingZoneId})
			.getMany();
	}
}
```

Then register the repository in `DatabaseModule` under **both** `providers` and `exports`.

### Transactions (every mutation)
Transactions are shared across modules through `TransactionManagerService` (one shared QueryRunner). Use the methods inherited by the repository:

```ts
await this.queueAddEmitter.beforeAddingElement({queueElement: draft}); // validation hooks, before the transaction

await this.queueRepository.startTransaction();
try {
	const queueElement = await this.queueRepository.saveQueueElement(draft);
	await this.queueAddEmitter.afterAddingElement({queueElement}); // other modules' writes join the same transaction
	await this.queueRepository.commitTransaction();
	return queueElement;
} catch (e) {
	await this.queueRepository.rollbackTransaction();
	throw e;
}
```

Reference: `src/user/queue/core/service/abstract-queue-add.service.ts`.

## Internal exchange: communication between modules (mandatory)

**A feature module never injects another feature module's service.** Cross-module calls go through the exchange in `src/core/utils/internal-exchange/`:
- **Query** (request/response) uses `emitter.query<R>(...)` and returns `QueryExchangeResponse<R>`, which is `{data}` or `{error}`. It never throws.
- **Emit** (awaited broadcast) uses `emitter.emit(...)`. A listener may throw to abort the flow, e.g. resource validation before a queue element is added.

The only things shared directly are `DatabaseModule` repositories and `core/` utilities.

Folder layout inside a feature:

```
<feature>/exchange/
  index.ts
  query/       <feature>-query.emitter.ts, <feature>-query.names.ts, types.ts
  emit/        <feature>.emitter.ts, <feature>.names.ts, <x>.event.ts | type.ts, index.ts
  subscriber/  <source>.subscriber.ts      # listeners, in the module that OWNS the logic
```

Event names are string enums valued `<area>.<feature>.<snake_case_action>`:

```ts
export enum BuildingQueryNames {
	GetBuildingById = 'global.building.get_building_by_id',
	CalculateTimeInSecondsToUpgradeBuilding = 'global.building.calculate_time_in_seconds',
}
```

The emitter is owned by the feature that answers, has one method per event, and injects the abstract token:

```ts
@Injectable()
export class BuildingQueryEmitter {
	constructor(
		@Inject(InternalExchangeEmitter)
		private readonly emitter: InternalExchangeEmitter,
	) {}

	public getBuildingById(buildingId: string): Promise<QueryExchangeResponse<BuildingModel | null>> {
		return this.emitter.query<BuildingModel | null>({
			eventName: BuildingQueryNames.GetBuildingById,
			requestData: {id: buildingId},
		});
	}
}
```

The subscriber is thin, delegates to a service in one line, and is registered in its own module's `providers`:

```ts
@Injectable()
export class BuildingQuerySubscriber {
	constructor(private readonly buildingService: BuildingService) {}

	@InternalExchangeQuery(BuildingQueryNames.GetBuildingById)
	public getBuildingById({id}: {id: string}): Promise<BuildingModel | null> {
		return this.buildingService.getBuildingById(id);
	}
}

// broadcast listener
@InternalExchangeEmitListener(BuildingQueueNames.AfterAddingElement)
public consumeResourcesOnQueue(input: BuildingQueueProcessing): Promise<void> {
	return this.queueExtractor.useResourcesOnQueueUpdate(input);
}
```

The consumer adds the foreign emitter to its own `providers`, imported from the feature barrel (`@warp-core/global/building`), and handles errors explicitly:

```ts
const {data, error} = await this.buildingQueryEmitter.getBuildingById(id);
if (error) {
	throw new InternalEmitterError(error.message);
}
if (!data) {
	throw new QueueError('Failed to get building');
}
```

Further rules:
- Payloads are `type` aliases, not classes (`HabitatCreatedEvent = {habitat: HabitatModel}`, `QueueProcessing<T> = {queueElement: T}`).
- Lifecycle events come in **before/after pairs** (`before_adding_element` / `after_adding_element`, `created_before_save` / `created_after_save`).
- Subscriber files are named after the **event source** (`queue-processing.subscriber.ts`, `new-habitat.subscriber.ts`).

## Queues

All queue logic lives in the abstracts in `src/user/queue/core/`. **A new queue type (e.g. technology) must mirror `building-queue/` and `research-queue/` file by file**, extending:

| core abstract | concrete (building-queue example) |
|---|---|
| `service/abstract-queue-add.service.ts` | `add/building-queue-add.service.ts` |
| `service/abstract-queue-draft.service.ts` | `add/building-queue-draft.service.ts` |
| `service/abstract-prepare-queue-element.service.ts` | `add/prepare-single-building-queue-element.service.ts` |
| `service/abstract-queue-handler.service.ts` | `building-queue-handler.service.ts` |
| `input/validator/abstract-validate-queue-element.service.ts` | `input/validator/validate-single-queue-element.service.ts` |
| `calculate-resources/abstract-queue-cost-calculation.service.ts` | `add/calculate-resources/simple-building-calculation.service.ts` |
| `exchange/abstract-queue-add.emitter.ts`, `abstract-queue-processing.emitter.ts` | `exchange/emit/building-queue-add.emitter.ts`, `building-queue-processing.emitter.ts` |
| `database/repository/abstract-queue-element.repository.ts` | `database/repository/building-queue.repository.ts` |

- Concrete classes are mostly a constructor that passes concrete dependencies to `super(...)`, plus the abstract template methods.
- Generic parameter names are `TInput`, `TQueueElement` and `TValidationContext`.
- Concrete emitters only set the event names:

```ts
@Injectable()
export class BuildingQueueAddEmitter extends AbstractQueueAddEmitter<BuildingQueueElementModel> {
	protected readonly beforeAddingEventName = BuildingQueueNames.BeforeAddingElement;
	protected readonly afterAddingEventName = BuildingQueueNames.AfterAddingElement;

	constructor(@Inject(InternalExchangeEmitter) emitter: InternalExchangeEmitter) {
		super(emitter);
	}
}
```

## Naming and file suffixes

File names are kebab-case with a role suffix; class names are PascalCase with a matching suffix.

| File | Class / export |
|---|---|
| `x.module.ts` | `XModule` |
| `x.resolver.ts` | `XResolver` |
| `verb-phrase.service.ts` (e.g. `create-new-habitat.service.ts`) | `CreateNewHabitatService` |
| `abstract-x.service.ts` | `AbstractXService<...>` |
| `x.model.ts` (only in `src/database/model`, or non-entity GraphQL types) | `XModel` |
| `x.model-interface.ts`, `x.interface.ts`, `x.resolver-interface.ts` | `XInterface` |
| `input/x.input.ts` | `XInput` (`@InputType`) |
| `input/validator/x.validator.ts` | `XValidator` |
| `exchange/**/x.emitter.ts`, `x.names.ts`, `x.subscriber.ts` | `XEmitter` / `XQueryEmitter`, `XNames` enum, `XSubscriber` |
| `x.event.ts`, `type.ts`, `types.ts` | `type` aliases |
| `exception/x.error.ts`, `x.exception.ts` | `XError`, `XException` |
| `x.util.ts` | exported functions |
| `x.decorator.ts`, `x.guard.ts`, `x.strategy.ts`, `x.middleware.ts`, `x.enum.ts`, `x.config.ts` | — |
| `x.spec.ts` (next to the source) | — |

Common feature subfolders are `service/`, `input/`, `input/validator/`, `exchange/`, `exception/`, `install/`, `add/` and `add/calculate-resources/`.

## Code style

These are enforced by ESLint and Prettier:
- Tabs, single quotes, no bracket spacing (`{Foo}`), trailing commas, `arrowParens: avoid`.
- Explicit return types on every function and method.
- Explicit member accessibility (`public` / `private` / `protected`) everywhere except constructors.
- No `any`. Write `T[]`, not `Array<T>`. No unused imports.
- Imports are ordered: external packages, a blank line, then `@warp-core/*`, alphabetized.

Conventions:
- Constructor DI with `private readonly` (`protected readonly` in abstract classes).
- Abstract classes serve as DI tokens (`InternalExchangeEmitter`, `BuildingQueueResourceConsumerInterface`). Avoid string tokens.
- `new Logger(X.name)` / `new Logger(this.constructor.name)`.
- JSDoc on abstract and contract methods.
- Dates: use luxon for arithmetic (`DateTime.fromJSDate(d).plus({second: n}).toUTC().toJSDate()`). Entities store JS `Date`.

## Other patterns

- **Resolvers** are thin and delegate to services in one line. Operation names are explicit and namespaced as `feature_action` (`buildingQueue_add`, `resource_getAll`), and every operation has a `description`. Use `@ResolveField` for lazy relations.
- **Validation** has two layers:
  1. class-validator decorators with messages on the `@InputType`.
  2. A pipe extending `CustomValidator<T>` (`core/validation/abstract-custom.validator.ts`), used as `@Args('addToQueue', AddToQueueValidator)`.

  Queue validators implement `QueueItemValidatorInterface`. They run in parallel and call `validationError.addError(field, message)` instead of throwing. The service throws `QueueValidationError` only when `hasErrors()`.
- **Exceptions** extend Nest HTTP exceptions:
  - `QueueValidationError` and `InsufficientResourcesException` extend `UnprocessableEntityException`. GraphQL formats them as `{message, validationError}`.
  - `DatabaseException` extends `BadRequestException`.
  - `InternalEmitterError` extends `InternalServerErrorException`.

  Domain and setup failures use `Error` subclasses (`QueueError`, `InstallError`).
- **Mechanics** are pluggable implementations chosen by config. Mark an implementation with `@AddMechanic(GroupToken, 'alias')` and register it with `RegisterMechanic.forFeature(GroupToken, 'runtime.mechanics...')`. See `docs/mechanics.md`.
- **Install**: put `@AddInstallService(XInstallService)` on the module. The service extends `AbstractInstallationService<T>`. See `docs/install/`.

## Generated files

- **`src/schema.gql` is generated** by `autoSchemaFile` from the code-first decorators every time the app boots (including e2e runs).
  - It is gitignored. **Never edit it by hand and never commit it.** To change the GraphQL API, change the models, inputs and resolvers.
  - Read it only as a reference for the current GraphQL API.

## Testing

Jest has two projects in `jest.config.ts`: `unit` (`src/**/*.spec.ts`) and `e2e` (`test/e2e/**/*.spec.ts`).

### Unit tests (mandatory)
- **Every concrete `*.service.ts` must have its own colocated `*.spec.ts`.**
  - Abstract base classes are covered through the specs of their concrete subclasses.
  - When you touch a service that has no spec, add one.
  - Validators and repositories follow the same pattern.
- Auto-mock dependencies with `jest.mock('@warp-core/...')`. Provide the **real classes** in `Test.createTestingModule({providers})` so Nest injects the auto-mocks. Type them as `jest.Mocked<T>`.
- Call `jest.clearAllMocks()` at the start of `beforeEach`.
- Stub with `jest-when`: `when(mock.fn).expectCalledWith(args).mockResolvedValueOnce(value)`.
- Repositories that use `manager`/transactions: call `prepareRepositoryMock(Repo)` in `beforeAll` (`test/database/repository/prepare-repository-mock.ts`).
- `RuntimeConfig`: add `coreConfigMock` (`test/core-config-mock.ts`) to `providers` and mutate values in the test.
- **Fixtures are minimal.** Objects passed into the class under test contain **only the properties that code path actually reads**, cast with `as XModel` / `as unknown as XModel[]`. Don't build full entities, factories or builders.
- Structure: a top-level `describe('<Readable class name>')`, a nested `describe('<methodName>')`, and `it('should ... when ...')`. Use `describe.each(testCases)` for case tables.
- Repository specs provide `{provide: DataSource, useValue: {createEntityManager: () => {}}}`, `jest.spyOn(repo, 'find')`, and assert the query shape with `expect.objectContaining({where: ...})`.

```ts
jest.mock('@warp-core/database/repository/habitat.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');

describe('Habitat service tests', () => {
	let habitatService: HabitatService;
	let habitatRepository: jest.Mocked<HabitatRepository>;
	let authorizedHabitatModel: AuthorizedHabitatModel;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [HabitatService, HabitatRepository, AuthorizedHabitatModel],
		}).compile();

		habitatService = module.get(HabitatService);
		habitatRepository = module.get(HabitatRepository);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
	});

	describe('getHabitatsForLoggedIn', () => {
		it('should return array of habitats when habitats for user id exists', async () => {
			const habitats = [{id: 10}, {id: 20}] as HabitatModel[]; // only what is needed
			authorizedHabitatModel.userId = 5;

			when(habitatRepository.getHabitatsByUserId)
				.expectCalledWith(5)
				.mockResolvedValueOnce(habitats);

			expect(await habitatService.getHabitatsForLoggedIn()).toEqual(habitats);
		});
	});
});
```

### E2E tests (`test/e2e/<feature>/<scenario>.spec.ts`)
- **Every GraphQL operation and REST endpoint needs e2e coverage** of the happy path and its main error cases. Name files after the scenario (`building-queue-basic-errors.spec.ts`).
- The global setup (`test/e2e/utils/setup-tests.ts`) runs before each test: it drops and re-synchronizes the test DB, then installs seed data from `test/e2e/test-install-files/*.yaml`. Each test starts clean.
- Boot with `createNestApplicationE2E()` and talk to the app with `requestGraphQL(app.getHttpServer())` (`GraphqlRequestTest`: `registerAndAuthenticate`, `query`, `mutation`, `send`). Use raw `supertest` for REST.
- Change game config by mutating `app.get(RuntimeConfig)` in `beforeEach`. Simulate time with `jest.useFakeTimers().setSystemTime(...)` and restore it in `afterEach`.
- Use the custom matchers in `test/expect-extend/resource-assert.ts` (`toHaveResource`, `toHaveResourceWithValue`, ...).

```ts
describe('Building queue basic errors', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());
		app.get(RuntimeConfig).habitat.buildingQueue.maxElementsInQueue = 1;
		return requestTest.registerAndAuthenticate(2);
	});

	it('should throw error when provided building does not exists', async () => {
		const response = await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {fields: ['startLevel', 'endLevel', 'isConsumed']},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {localBuildingZoneId: 10, endLevel: 1, buildingId: 'duck_school'},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.buildingId).toContain('Provided building does not exist.');
	});
});
```
