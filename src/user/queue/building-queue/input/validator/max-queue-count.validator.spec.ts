import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {coreConfigMock} from '@warp-core/test/core-config-mock';
import {QueueInputValidationEvent} from '@warp-core/user/queue/building-queue/event/queue-input-validation.event';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {MaxQueueCountValidator} from '@warp-core/user/queue/building-queue/input/validator/max-queue-count.validator';

jest.mock('@warp-core/database/repository/building-queue.repository');
jest.mock('@warp-core/auth/payload/model/habitat.model');
jest.mock('@warp-core/core/config/runtime.config');
jest.mock('@nestjs/config');

describe('max queue elements count validator', () => {
	let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
	let habitatMock: jest.Mocked<AuthorizedHabitatModel>;
	let runtimeConfig: jest.Mocked<RuntimeConfig>;
	let maxQueueCountValidator: MaxQueueCountValidator;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BuildingQueueRepository,
				AuthorizedHabitatModel,
				MaxQueueCountValidator,
				coreConfigMock,
			],
		}).compile();
		buildingQueueRepository = module.get(BuildingQueueRepository);
		runtimeConfig = module.get(RuntimeConfig);
		habitatMock = module.get(AuthorizedHabitatModel);
		maxQueueCountValidator = module.get(MaxQueueCountValidator);
	});

	describe('validate', () => {
		it('should add error when queue count equals max elements in queue from config', async () => {
			habitatMock.id = 5;
			const maxQueueElements = 10;
			const queueValidationEvent = new QueueInputValidationEvent(
				{} as AddToQueueInput,
				{} as BuildingModel,
				{} as BuildingZoneModel,
			);

			when(buildingQueueRepository.countActiveBuildingQueueElementsForHabitat)
				.calledWith(habitatMock.id)
				.mockResolvedValue(maxQueueElements);

			runtimeConfig.habitat.buildingQueue.maxElementsInQueue = maxQueueElements;

			await maxQueueCountValidator.validate(queueValidationEvent);

			expect(queueValidationEvent.hasError()).toBe(true);
			expect(queueValidationEvent.queueErrors).toEqual({
				queueInput: [`Max queue count (${maxQueueElements}) has been reached`],
			});
		});

		it('should pass validation when queue elements count does not reach max queue elements from config', async () => {
			habitatMock.id = 5;
			const maxQueueElements = 10;
			const queueValidationEvent = new QueueInputValidationEvent(
				{} as AddToQueueInput,
				{} as BuildingModel,
				{} as BuildingZoneModel,
			);

			when(buildingQueueRepository.countActiveBuildingQueueElementsForHabitat)
				.calledWith(habitatMock.id)
				.mockResolvedValue(3);

			runtimeConfig.habitat.buildingQueue.maxElementsInQueue = maxQueueElements;

			await maxQueueCountValidator.validate(queueValidationEvent);

			expect(queueValidationEvent.hasError()).toBe(false);
		});
	});
});
