import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {PrepareSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/add/prepare-single-unit-queue-element.service';
import {UnitQueueDraftService} from '@warp-core/user/queue/unit-queue/add/unit-queue-draft.service';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

jest.mock(
	'@warp-core/user/queue/unit-queue/add/prepare-single-unit-queue-element.service',
);

describe('Unit queue draft', () => {
	let unitQueueDraftService: UnitQueueDraftService;
	let prepareUnitQueueElement: jest.Mocked<PrepareSingleUnitQueueElementService>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [UnitQueueDraftService, PrepareSingleUnitQueueElementService],
		}).compile();

		unitQueueDraftService = module.get(UnitQueueDraftService);
		prepareUnitQueueElement = module.get(PrepareSingleUnitQueueElementService);
	});

	describe('getDraft', () => {
		it('should return prepared unit queue element when input is provided', async () => {
			const addToQueueInput = {
				unitId: 'engineer',
				amount: 1,
			} as AddUnitToQueueInput;
			const preparedQueueElement = {id: null} as UnitQueueElementModel;

			when(prepareUnitQueueElement.getQueueElement)
				.expectCalledWith(addToQueueInput)
				.mockResolvedValueOnce(preparedQueueElement);

			expect(await unitQueueDraftService.getDraft(addToQueueInput)).toBe(
				preparedQueueElement,
			);
		});
	});
});
