import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {UnitQueueRepository} from '@warp-core/database/repository/unit-queue.repository';
import {PrepareSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/add/prepare-single-unit-queue-element.service';
import {UnitQueueAddService} from '@warp-core/user/queue/unit-queue/add/unit-queue-add.service';
import {UnitQueueAddEmitter} from '@warp-core/user/queue/unit-queue/exchange/emit/unit-queue-add.emitter';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

jest.mock('@warp-core/database/repository/unit-queue.repository');
jest.mock(
	'@warp-core/user/queue/unit-queue/add/prepare-single-unit-queue-element.service',
);
jest.mock(
	'@warp-core/user/queue/unit-queue/exchange/emit/unit-queue-add.emitter',
);

describe('Unit queue add', () => {
	let unitQueueAddService: UnitQueueAddService;
	let prepareUnitQueueElement: jest.Mocked<PrepareSingleUnitQueueElementService>;
	let unitQueueRepository: jest.Mocked<UnitQueueRepository>;
	let unitQueueAddEmitter: jest.Mocked<UnitQueueAddEmitter>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UnitQueueAddService,
				PrepareSingleUnitQueueElementService,
				UnitQueueRepository,
				UnitQueueAddEmitter,
			],
		}).compile();

		unitQueueAddService = module.get(UnitQueueAddService);
		prepareUnitQueueElement = module.get(PrepareSingleUnitQueueElementService);
		unitQueueRepository = module.get(UnitQueueRepository);
		unitQueueAddEmitter = module.get(UnitQueueAddEmitter);
	});

	describe('saveQueueElement', () => {
		const addToQueueInput = {
			unitId: 'engineer',
			amount: 2,
		} as AddUnitToQueueInput;

		it('should save queue element and commit transaction when nothing fails', async () => {
			const draftQueueElement = {id: null} as UnitQueueElementModel;
			const savedQueueElement = {id: 1} as UnitQueueElementModel;

			when(prepareUnitQueueElement.getQueueElement)
				.expectCalledWith(addToQueueInput)
				.mockResolvedValueOnce(draftQueueElement);
			when(unitQueueRepository.saveQueueElement)
				.expectCalledWith(draftQueueElement)
				.mockResolvedValueOnce(savedQueueElement);

			const result =
				await unitQueueAddService.saveQueueElement(addToQueueInput);

			expect(result).toBe(savedQueueElement);
			expect(unitQueueAddEmitter.beforeAddingElement).toHaveBeenCalledWith({
				queueElement: draftQueueElement,
			});
			expect(unitQueueAddEmitter.afterAddingElement).toHaveBeenCalledWith({
				queueElement: savedQueueElement,
			});
			expect(unitQueueRepository.startTransaction).toHaveBeenCalledTimes(1);
			expect(unitQueueRepository.commitTransaction).toHaveBeenCalledTimes(1);
			expect(unitQueueRepository.rollbackTransaction).not.toHaveBeenCalled();
		});

		it('should rollback transaction when after adding element listener throws error', async () => {
			const draftQueueElement = {id: null} as UnitQueueElementModel;

			when(prepareUnitQueueElement.getQueueElement)
				.expectCalledWith(addToQueueInput)
				.mockResolvedValueOnce(draftQueueElement);
			unitQueueRepository.saveQueueElement.mockResolvedValueOnce({
				id: 1,
			} as UnitQueueElementModel);
			unitQueueAddEmitter.afterAddingElement.mockRejectedValueOnce(
				new Error('something went wrong'),
			);

			await expect(
				unitQueueAddService.saveQueueElement(addToQueueInput),
			).rejects.toThrow('something went wrong');

			expect(unitQueueRepository.rollbackTransaction).toHaveBeenCalledTimes(1);
			expect(unitQueueRepository.commitTransaction).not.toHaveBeenCalled();
		});

		it('should not start transaction when before adding element listener throws error', async () => {
			const draftQueueElement = {id: null} as UnitQueueElementModel;

			when(prepareUnitQueueElement.getQueueElement)
				.expectCalledWith(addToQueueInput)
				.mockResolvedValueOnce(draftQueueElement);
			unitQueueAddEmitter.beforeAddingElement.mockRejectedValueOnce(
				new Error('not enough resources'),
			);

			await expect(
				unitQueueAddService.saveQueueElement(addToQueueInput),
			).rejects.toThrow('not enough resources');

			expect(unitQueueRepository.startTransaction).not.toHaveBeenCalled();
			expect(unitQueueRepository.saveQueueElement).not.toHaveBeenCalled();
		});
	});
});
