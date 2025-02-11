import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingQueueDraftService} from '@warp-core/user/queue/building-queue/add/building-queue-draft.service';
import {PrepareSingleBuildingQueueElementService} from '@warp-core/user/queue/building-queue/add/prepare-single-building-queue-element.service';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

jest.mock(
	'@warp-core/user/queue/building-queue/add/prepare-single-building-queue-element.service',
);

describe('Prepare building queue draft', () => {
	let buildingQueueDraft: BuildingQueueDraftService;
	let prepareBuildingQueueElement: jest.Mocked<PrepareSingleBuildingQueueElementService>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueueDraftService,
				PrepareSingleBuildingQueueElementService,
			],
		}).compile();

		buildingQueueDraft = module.get(BuildingQueueDraftService);
		prepareBuildingQueueElement = module.get(
			PrepareSingleBuildingQueueElementService,
		);
	});

	describe('getDraft', () => {
		it('should return draft of the building queue element', async () => {
			const addToQueueElement = {
				localBuildingZoneId: 1,
				endLevel: 5,
			} as AddToQueueInput;

			const preparedBuildingQueue = {
				id: 1,
			} as BuildingQueueElementModel;

			when(prepareBuildingQueueElement.getQueueElement)
				.expectCalledWith(addToQueueElement)
				.mockResolvedValue(preparedBuildingQueue);

			const draftQueueElement =
				await buildingQueueDraft.getDraft(addToQueueElement);

			expect(draftQueueElement).toEqual(preparedBuildingQueue);
		});
	});
});
