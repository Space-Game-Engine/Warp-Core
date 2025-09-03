import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {prepareRepositoryMock} from '@warp-core/test/database/repository/prepare-repository-mock';
import {BuildingQueueAddService} from '@warp-core/user/queue/building-queue/add/building-queue-add.service';
import {PrepareSingleBuildingQueueElementService} from '@warp-core/user/queue/building-queue/add/prepare-single-building-queue-element.service';
import {BuildingQueueAddEmitter} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue-add.emitter';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

jest.mock('@warp-core/database/repository/building-queue.repository');
jest.mock(
	'@warp-core/user/queue/building-queue/add/prepare-single-building-queue-element.service',
);
jest.mock(
	'@warp-core/user/queue/building-queue/exchange/emit/building-queue-add.emitter',
);

describe('Building queue add', () => {
	let buildingQueueAddElement: BuildingQueueAddService;
	let prepareBuildingQueueElement: jest.Mocked<PrepareSingleBuildingQueueElementService>;
	let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
	let buildingQueueAddEmitter: jest.Mocked<BuildingQueueAddEmitter>;

	beforeAll(() => {
		prepareRepositoryMock(BuildingQueueRepository);
	});

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueueAddService,
				PrepareSingleBuildingQueueElementService,
				BuildingQueueRepository,
				BuildingQueueAddEmitter,
			],
		}).compile();

		buildingQueueAddElement = module.get(BuildingQueueAddService);
		buildingQueueRepository = module.get(BuildingQueueRepository);
		prepareBuildingQueueElement = module.get(
			PrepareSingleBuildingQueueElementService,
		);
		buildingQueueAddEmitter = module.get(BuildingQueueAddEmitter);
	});

	describe('saveQueueElement', () => {
		it('should save a queue element and commit transaction', async () => {
			const addToQueueElement = {
				localBuildingZoneId: 1,
				endLevel: 5,
			} as AddToQueueInput;

			const savedQueueElement = {
				id: 1,
			} as BuildingQueueElementModel;

			when(prepareBuildingQueueElement.getQueueElement)
				.expectCalledWith(addToQueueElement)
				.mockResolvedValue(savedQueueElement);

			when(buildingQueueRepository.save)
				.calledWith(savedQueueElement)
				.mockResolvedValue(savedQueueElement);

			const processedQueueElement =
				await buildingQueueAddElement.saveQueueElement(addToQueueElement);

			expect(processedQueueElement).toEqual(savedQueueElement);
			expect(buildingQueueRepository.commitTransaction).toHaveBeenCalledTimes(
				1,
			);
			expect(buildingQueueAddEmitter.beforeAddingElement).toHaveBeenCalledTimes(
				1,
			);
			expect(buildingQueueAddEmitter.beforeAddingElement).toHaveBeenCalledWith({
				queueElement: savedQueueElement,
			});
			expect(buildingQueueAddEmitter.afterAddingElement).toHaveBeenCalledTimes(
				1,
			);
			expect(buildingQueueAddEmitter.afterAddingElement).toHaveBeenCalledWith({
				queueElement: savedQueueElement,
			});
		});

		it('should rollback shared transaction when event throws error', async () => {
			const addToQueueElement = {
				localBuildingZoneId: 1,
				endLevel: 5,
			} as AddToQueueInput;

			const draftBuildingQueueElement = {
				id: 1,
			} as BuildingQueueElementModel;

			when(prepareBuildingQueueElement.getQueueElement)
				.expectCalledWith(addToQueueElement)
				.mockResolvedValue(draftBuildingQueueElement);

			when(buildingQueueRepository.save)
				.calledWith(draftBuildingQueueElement)
				.mockResolvedValue(draftBuildingQueueElement);
			when(buildingQueueAddEmitter.afterAddingElement).mockRejectedValue(
				new Error('something went wrong'),
			);

			await expect(
				buildingQueueAddElement.saveQueueElement(addToQueueElement),
			).rejects.toThrow('something went wrong');
		});
	});
});
