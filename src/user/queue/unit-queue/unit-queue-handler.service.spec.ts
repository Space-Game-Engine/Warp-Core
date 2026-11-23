import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {UnitQueueRepository} from '@warp-core/database/repository/unit-queue.repository';
import {UnitQueueProcessingEmitter} from '@warp-core/user/queue/unit-queue/exchange/emit/unit-queue-processing.emitter';
import {UnitQueueHandlerService} from '@warp-core/user/queue/unit-queue/unit-queue-handler.service';
import {UnitInstanceQueryEmitter} from '@warp-core/user/unit-instance';

jest.mock('@warp-core/database/repository/unit-queue.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock(
	'@warp-core/user/unit-instance/exchange/query/unit-instance-query.emitter',
);
jest.mock(
	'@warp-core/user/queue/unit-queue/exchange/emit/unit-queue-processing.emitter',
);

describe('Unit queue handler service', () => {
	let unitQueueHandlerService: UnitQueueHandlerService;
	let unitQueueRepository: jest.Mocked<UnitQueueRepository>;
	let unitInstanceQueryEmitter: jest.Mocked<UnitInstanceQueryEmitter>;
	let authorizedHabitatModel: AuthorizedHabitatModel;
	let eventEmitter: jest.Mocked<UnitQueueProcessingEmitter>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UnitQueueHandlerService,
				UnitQueueRepository,
				UnitInstanceQueryEmitter,
				AuthorizedHabitatModel,
				UnitQueueProcessingEmitter,
			],
		}).compile();

		unitQueueHandlerService = module.get(UnitQueueHandlerService);
		unitQueueRepository = module.get(UnitQueueRepository);
		unitInstanceQueryEmitter = module.get(UnitInstanceQueryEmitter);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);
		eventEmitter = module.get(UnitQueueProcessingEmitter);

		authorizedHabitatModel.id = 1;
	});

	describe('getQueueItemsForHabitat', () => {
		it('should return current unit queue for logged in habitat', async () => {
			const queueElements = [{id: 10}] as UnitQueueElementModel[];

			when(unitQueueRepository.getCurrentQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce(queueElements);

			expect(await unitQueueHandlerService.getQueueItemsForHabitat()).toBe(
				queueElements,
			);
		});
	});

	describe('resolveQueue', () => {
		it('should not create units when there are no unresolved queue elements', async () => {
			when(unitQueueRepository.getUnresolvedQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce([]);

			await unitQueueHandlerService.resolveQueue();

			expect(
				unitInstanceQueryEmitter.createUnitInstances,
			).not.toHaveBeenCalled();
			expect(unitQueueRepository.markElementAsConsumed).not.toHaveBeenCalled();
		});

		it('should create units and consume queue element when queue element is finished', async () => {
			const queueElement = {
				id: 10,
				habitatId: 1,
				unitId: 'engineer',
				amount: 3,
				isConsumed: false,
			} as UnitQueueElementModel;

			when(unitQueueRepository.getUnresolvedQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce([queueElement]);
			when(unitInstanceQueryEmitter.createUnitInstances)
				.expectCalledWith({habitatId: 1, unitId: 'engineer', amount: 3})
				.mockResolvedValueOnce({data: [], error: undefined});

			await unitQueueHandlerService.resolveQueue();

			expect(queueElement.isConsumed).toBe(true);
			expect(unitQueueRepository.markElementAsConsumed).toHaveBeenCalledWith(
				queueElement,
			);
			expect(eventEmitter.beforeProcessing).toHaveBeenCalledWith({
				queueElement,
			});
			expect(eventEmitter.afterProcessing).toHaveBeenCalledWith({
				queueElement,
			});
		});

		it('should throw internal emitter error and not consume queue element when creating units fails', async () => {
			const queueElement = {
				id: 10,
				habitatId: 1,
				unitId: 'engineer',
				amount: 1,
				isConsumed: false,
			} as UnitQueueElementModel;

			when(unitQueueRepository.getUnresolvedQueueForHabitat)
				.expectCalledWith(1)
				.mockResolvedValueOnce([queueElement]);
			unitInstanceQueryEmitter.createUnitInstances.mockResolvedValueOnce({
				data: undefined,
				error: {message: 'emitter failed'},
			} as never);

			await expect(unitQueueHandlerService.resolveQueue()).rejects.toThrow(
				new InternalEmitterError('emitter failed'),
			);
			expect(unitQueueRepository.markElementAsConsumed).not.toHaveBeenCalled();
		});
	});
});
