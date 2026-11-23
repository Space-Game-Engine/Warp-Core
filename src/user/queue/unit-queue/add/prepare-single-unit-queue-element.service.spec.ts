import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';
import {DeepPartial} from 'typeorm';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {UnitQueueRepository} from '@warp-core/database/repository/unit-queue.repository';
import {UnitQueryEmitter} from '@warp-core/global/unit';
import {QueueError} from '@warp-core/user/queue/core/exception/queue.error';
import {UnitQueueResourceConsumerInterface} from '@warp-core/user/queue/unit-queue/add/calculate-resources/unit-queue-resource-consumer.interface';
import {PrepareSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/add/prepare-single-unit-queue-element.service';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

jest.mock('@warp-core/database/repository/unit-queue.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock('@warp-core/global/unit/exchange/query/unit-query.emitter');

describe('Prepare single unit queue element', () => {
	let prepareUnitQueueElement: PrepareSingleUnitQueueElementService;
	let unitQueueRepository: jest.Mocked<UnitQueueRepository>;
	let unitQueryEmitter: jest.Mocked<UnitQueryEmitter>;
	let habitatModel: AuthorizedHabitatModel;
	let resourcesCalculator: jest.Mocked<UnitQueueResourceConsumerInterface>;

	const now = new Date('2026-01-01T10:00:00Z');
	const unit = {
		id: 'engineer',
		timeToBuildInSeconds: 30,
	} as UnitBlueprintGlobalModel;
	const resourcesCosts = [
		{resource: {id: 'wood'}, cost: 30},
	] as QueueElementCostModel[];
	const addToQueueInput = {
		unitId: 'engineer',
		amount: 3,
	} as AddUnitToQueueInput;

	beforeEach(async () => {
		jest.clearAllMocks();
		jest.useFakeTimers().setSystemTime(now);

		resourcesCalculator = {
			calculateResourcesCosts: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PrepareSingleUnitQueueElementService,
				UnitQueueRepository,
				UnitQueryEmitter,
				AuthorizedHabitatModel,
				{
					provide: UnitQueueResourceConsumerInterface,
					useValue: resourcesCalculator,
				},
			],
		}).compile();

		prepareUnitQueueElement = module.get(PrepareSingleUnitQueueElementService);
		unitQueueRepository = module.get(UnitQueueRepository);
		unitQueryEmitter = module.get(UnitQueryEmitter);
		habitatModel = module.get(AuthorizedHabitatModel);

		habitatModel.id = 5;
		(unitQueueRepository.create as jest.Mock).mockImplementation(
			(entity: DeepPartial<UnitQueueElementModel>) =>
				Object.assign(new UnitQueueElementModel(), entity),
		);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('getQueueElement', () => {
		it('should create draft starting now and lasting for every unit when queue is empty', async () => {
			when(unitQueryEmitter.getUnitById)
				.expectCalledWith('engineer')
				.mockResolvedValueOnce({data: unit, error: undefined});
			when(resourcesCalculator.calculateResourcesCosts)
				.expectCalledWith(addToQueueInput, unit)
				.mockResolvedValueOnce(resourcesCosts);
			when(unitQueueRepository.getCurrentQueueForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce([]);

			const queueElement =
				await prepareUnitQueueElement.getQueueElement(addToQueueInput);

			expect(queueElement).toMatchObject({
				id: null,
				unitId: 'engineer',
				habitatId: 5,
				amount: 3,
				isConsumed: false,
				costs: resourcesCosts,
			});
			expect(queueElement.startTime).toEqual(now);
			expect(queueElement.endTime).toEqual(new Date(now.getTime() + 90 * 1000));
		});

		it('should start after last queue element when queue is not empty', async () => {
			const lastQueueElementEndTime = new Date('2026-01-01T12:00:00Z');

			when(unitQueryEmitter.getUnitById)
				.expectCalledWith('engineer')
				.mockResolvedValueOnce({data: unit, error: undefined});
			when(resourcesCalculator.calculateResourcesCosts)
				.expectCalledWith(addToQueueInput, unit)
				.mockResolvedValueOnce(resourcesCosts);
			when(unitQueueRepository.getCurrentQueueForHabitat)
				.expectCalledWith(5)
				.mockResolvedValueOnce([
					{endTime: lastQueueElementEndTime} as UnitQueueElementModel,
				]);

			const queueElement =
				await prepareUnitQueueElement.getQueueElement(addToQueueInput);

			expect(queueElement.startTime).toEqual(lastQueueElementEndTime);
			expect(queueElement.endTime).toEqual(
				new Date(lastQueueElementEndTime.getTime() + 90 * 1000),
			);
		});

		it('should throw internal emitter error when unit query returns error', async () => {
			when(unitQueryEmitter.getUnitById)
				.expectCalledWith('engineer')
				.mockResolvedValueOnce({
					data: undefined,
					error: {message: 'emitter failed'},
				} as never);

			await expect(
				prepareUnitQueueElement.getQueueElement(addToQueueInput),
			).rejects.toThrow(new InternalEmitterError('emitter failed'));
		});

		it('should throw queue error when unit does not exist', async () => {
			when(unitQueryEmitter.getUnitById)
				.expectCalledWith('engineer')
				.mockResolvedValueOnce({data: null, error: undefined});

			await expect(
				prepareUnitQueueElement.getQueueElement(addToQueueInput),
			).rejects.toThrow(new QueueError('Failed to get unit'));
		});
	});
});
