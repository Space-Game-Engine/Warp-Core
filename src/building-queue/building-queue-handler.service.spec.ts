import { Test, TestingModule } from "@nestjs/testing";
import { AuthorizedHabitatModel } from "@warp-core/auth";
import { BuildingQueueHandlerService } from "@warp-core/building-queue/building-queue-handler.service";
import { BuildingModel, BuildingQueueElementModel, BuildingQueueRepository, BuildingZoneModel, BuildingZoneRepository } from "@warp-core/database";
import { when } from "jest-when";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { QueueElementBeforeProcessingEvent } from "@warp-core/building-queue/event/queue-element-before-processing.event";
import { QueueElementAfterProcessingEvent } from "@warp-core/building-queue/event/queue-element-after-processing.event";

jest.mock("@warp-core/database/repository/building-queue.repository");
jest.mock("@warp-core/database/repository/building-zone.repository");
jest.mock("@warp-core/auth/payload/model/habitat.model");
jest.mock("@nestjs/event-emitter");

describe("Building queue handler service test", () => {
    let buildingQueueHandlerService: BuildingQueueHandlerService;
    let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
    let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
    let authorizedHabitatModel: AuthorizedHabitatModel;
    let eventEmitter: jest.Mocked<EventEmitter2>;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingQueueHandlerService,
                BuildingQueueRepository,
                BuildingZoneRepository,
                AuthorizedHabitatModel,
                EventEmitter2,
            ]
        }).compile();

        buildingQueueHandlerService = module.get<BuildingQueueHandlerService>(BuildingQueueHandlerService);
        buildingQueueRepository = module.get(BuildingQueueRepository);
        buildingZoneRepository = module.get(BuildingZoneRepository);
        authorizedHabitatModel = module.get(AuthorizedHabitatModel);
        eventEmitter = module.get(EventEmitter2);

        authorizedHabitatModel.buildingZones = [];
    });


    function expectEventToBeCalled(queueElements: BuildingQueueElementModel[]) {
        expect(eventEmitter.emitAsync).toBeCalledTimes(queueElements.length * 2);

        let counter = 0;
        for (const singleQueueElement of queueElements) {
            expect(eventEmitter.emitAsync).toHaveBeenNthCalledWith(
                ++counter,
                expect.stringMatching("building_queue.resolving.before_processing_element"),
                expect.objectContaining<QueueElementBeforeProcessingEvent>({
                    queueElement: singleQueueElement,
                })
            );
            
            expect(eventEmitter.emitAsync).toHaveBeenNthCalledWith(
                ++counter,
                expect.stringMatching("building_queue.resolving.after_processing_element"),
                expect.objectContaining<QueueElementAfterProcessingEvent>({
                    queueElement: singleQueueElement,
                })
            );
            
        }

    }

    describe("resolveQueue", () => {
        it("should not process any queue items as building queue repository not fetch any data", async () => {
            const habitatId = 1;

            authorizedHabitatModel.id = habitatId;
            when(buildingQueueRepository.getUnresolvedQueueForHabitat)
                .calledWith(habitatId)
                .mockResolvedValue([]);
            
            await buildingQueueHandlerService.resolveQueue();

            expect(buildingQueueRepository.update).not.toBeCalled();
            expect(buildingZoneRepository.update).not.toBeCalled();
            expect(eventEmitter.emitAsync).not.toBeCalled();
        });

        it("should process queue item when single queue items exists and building zone don't have building id set", async () => {
            const habitatId = 1;

            const building = {
                id: 3
            } as BuildingModel;

            const buildingZone = {
                level: 0,
                buildingId: null
            } as BuildingZoneModel;

            const queueElement = {
                buildingZone: buildingZone,
                endLevel: 1,
                building: building,
                isConsumed: false,
            } as BuildingQueueElementModel;

            authorizedHabitatModel.id = habitatId;
            (await authorizedHabitatModel.buildingZones).push(buildingZone);
            when(buildingQueueRepository.getUnresolvedQueueForHabitat)
                .calledWith(habitatId)
                .mockResolvedValue([
                    queueElement
                ]);

            await buildingQueueHandlerService.resolveQueue();

            expect(buildingQueueRepository.update).toBeCalledTimes(1);
            expect(buildingZoneRepository.update).toBeCalledTimes(1);

            expect(queueElement.isConsumed).toBe(true);
            expect(buildingZone.level).toBe(queueElement.endLevel);
            expect(buildingZone.buildingId).toBe(building.id);
            expectEventToBeCalled([queueElement]);
        });

        it("should process queue item when multiple queue items exists and building zone don't have building id set", async () => {
            const habitatId = 1;

            const building = {
                id: 3
            } as BuildingModel;

            const buildingZone = {
                level: 0,
                buildingId: null
            } as BuildingZoneModel;

            const queueElement1 = {
                buildingZone: buildingZone,
                endLevel: 1,
                building: building,
                isConsumed: false,
            } as BuildingQueueElementModel;

            const queueElement2 = {
                buildingZone: buildingZone,
                endLevel: 2,
                building: building,
                isConsumed: false,
            } as BuildingQueueElementModel;

            const queueElement3 = {
                buildingZone: buildingZone,
                endLevel: 3,
                building: building,
                isConsumed: false,
            } as BuildingQueueElementModel;

            authorizedHabitatModel.id = habitatId;
            (await authorizedHabitatModel.buildingZones).push(buildingZone);
            when(buildingQueueRepository.getUnresolvedQueueForHabitat)
                .calledWith(habitatId)
                .mockResolvedValue([
                    queueElement1,
                    queueElement2,
                    queueElement3,
                ]);

            await buildingQueueHandlerService.resolveQueue();

            expect(buildingQueueRepository.update).toBeCalledTimes(3);
            expect(buildingZoneRepository.update).toBeCalledTimes(3);

            expect(queueElement1.isConsumed).toBe(true);
            expect(queueElement2.isConsumed).toBe(true);
            expect(queueElement3.isConsumed).toBe(true);
            expect(buildingZone.level).toBe(queueElement3.endLevel);
            expect(buildingZone.buildingId).toBe(building.id);
            expectEventToBeCalled([
                queueElement1,
                queueElement2,
                queueElement3,
            ]);
        });

        it("should process queue item when single queue items exists and building zone have building id set", async () => {
            const habitatId = 1;

            const building = {
                id: 3
            } as BuildingModel;

            const buildingZone = {
                level: 0,
                buildingId: building.id
            } as BuildingZoneModel;

            const queueElement = {
                buildingZone: buildingZone,
                endLevel: 1,
                isConsumed: false,
            } as BuildingQueueElementModel;

            authorizedHabitatModel.id = habitatId;
            (await authorizedHabitatModel.buildingZones).push(buildingZone);
            when(buildingQueueRepository.getUnresolvedQueueForHabitat)
                .calledWith(habitatId)
                .mockResolvedValue([
                    queueElement
                ]);

            await buildingQueueHandlerService.resolveQueue();

            expect(buildingQueueRepository.update).toBeCalledTimes(1);
            expect(buildingZoneRepository.update).toBeCalledTimes(1);

            expect(queueElement.isConsumed).toBe(true);
            expect(buildingZone.level).toBe(queueElement.endLevel);
            expect(buildingZone.buildingId).toBe(building.id);
            expectEventToBeCalled([queueElement]);
        });
    });

    describe("resolveQueueForSingleBuildingZone", () => {
        it("should not process any queue items as building queue repository not fetch any data for single building zone", async () => {
            const buildingZoneId = 1;

            const buildingZone = {
                id: buildingZoneId
            } as BuildingZoneModel;

            when(buildingQueueRepository.getUnresolvedQueueForSingleBuildingZone)
                .calledWith(buildingZoneId)
                .mockResolvedValue([]);

            await buildingQueueHandlerService.resolveQueueForSingleBuildingZone(buildingZone);

            expect(buildingQueueRepository.update).not.toBeCalled();
            expect(buildingZoneRepository.update).not.toBeCalled();
            expect(eventEmitter.emitAsync).not.toBeCalled();
        });

        it("should process queue item when single queue items exists and building zone don't have building id set", async () => {
            const buildingZoneId = 1;

            const building = {
                id: 3
            } as BuildingModel; 

            const buildingZone = {
                id: buildingZoneId
            } as BuildingZoneModel;

            const queueElement = {
                buildingZone: buildingZone,
                endLevel: 1,
                building: building,
                isConsumed: false,
            } as BuildingQueueElementModel;

            when(buildingQueueRepository.getUnresolvedQueueForSingleBuildingZone)
                .calledWith(buildingZoneId)
                .mockResolvedValue([
                    queueElement
                ]);

            await buildingQueueHandlerService.resolveQueueForSingleBuildingZone(buildingZone);

            expect(buildingQueueRepository.update).toBeCalledTimes(1);
            expect(buildingZoneRepository.update).toBeCalledTimes(1);

            expect(queueElement.isConsumed).toBe(true);
            expect(buildingZone.level).toBe(queueElement.endLevel);
            expect(buildingZone.buildingId).toBe(building.id);
            expectEventToBeCalled([queueElement]);
        });
    });
});