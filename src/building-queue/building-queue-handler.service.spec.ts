import { Test, TestingModule } from "@nestjs/testing";
import { PayloadDataServiceMock } from "@warp-core/auth/payload/__mocks__/payload-data.service";
import { PayloadDataService } from "@warp-core/auth/payload/payload-data.service";
import { BuildingQueueHandlerService } from "@warp-core/building-queue/building-queue-handler.service";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { when } from "jest-when";

jest.mock("../database/repository/building-queue.repository");
jest.mock("../database/repository/building-zone.repository");

describe("Building queue handler service test", () => {
    let buildingQueueHandlerService: BuildingQueueHandlerService;
    let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
    let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
    let payloadDataService: PayloadDataServiceMock;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingQueueHandlerService,
                BuildingQueueRepository,
                BuildingZoneRepository,
                {
                    provide: PayloadDataService,
                    useValue: new PayloadDataServiceMock()
                },
            ]
        }).compile();

        buildingQueueHandlerService = module.get<BuildingQueueHandlerService>(BuildingQueueHandlerService);
        buildingQueueRepository = module.get(BuildingQueueRepository);
        buildingZoneRepository = module.get(BuildingZoneRepository);
        payloadDataService = module.get(PayloadDataService);
    });

    describe("resolveQueue", () => {
        it("should not process any queue items as building queue repository not fetch any data", async () => {
            const habitat = {
                getAuthId: () => 1
            } as HabitatModel;

            when(payloadDataService.getModel)
                .mockResolvedValue(habitat);
            when(buildingQueueRepository.findBy)
                .calledWith({
                    isConsumed: false,
                    endTime: expect.anything(),
                    buildingZone: {
                        habitatId: habitat.getAuthId()
                    }
                }).mockResolvedValue([]);
            
            await buildingQueueHandlerService.resolveQueue();

            expect(buildingQueueRepository.save).not.toBeCalled();
            expect(buildingZoneRepository.save).not.toBeCalled();
        });

        it("should process queue item when single queue items exists and building zone don't have building id set", async () => {
            const habitat = {
                getAuthId: () => 1
            } as HabitatModel;

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

            when(payloadDataService.getModel)
                .mockResolvedValue(habitat);
            when(buildingQueueRepository.findBy)
                .calledWith({
                    isConsumed: false,
                    endTime: expect.anything(),
                    buildingZone: {
                        habitatId: habitat.getAuthId()
                    }
                }).mockResolvedValue([
                    queueElement
                ]);

            await buildingQueueHandlerService.resolveQueue();

            expect(buildingQueueRepository.save).toBeCalledTimes(1);
            expect(buildingZoneRepository.save).toBeCalledTimes(1);

            expect(queueElement.isConsumed).toBe(true);
            expect(buildingZone.level).toBe(queueElement.endLevel);
            expect(buildingZone.buildingId).toBe(building.id);
        });

        it("should process queue item when multiple queue items exists and building zone don't have building id set", async () => {
            const habitat = {
                getAuthId: () => 1
            } as HabitatModel;

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

            when(payloadDataService.getModel)
                .mockResolvedValue(habitat);
            when(buildingQueueRepository.findBy)
                .calledWith({
                    isConsumed: false,
                    endTime: expect.anything(),
                    buildingZone: {
                        habitatId: habitat.getAuthId()
                    }
                }).mockResolvedValue([
                    queueElement1,
                    queueElement2,
                    queueElement3,
                ]);

            await buildingQueueHandlerService.resolveQueue();

            expect(buildingQueueRepository.save).toBeCalledTimes(3);
            expect(buildingZoneRepository.save).toBeCalledTimes(3);

            expect(queueElement1.isConsumed).toBe(true);
            expect(queueElement2.isConsumed).toBe(true);
            expect(queueElement3.isConsumed).toBe(true);
            expect(buildingZone.level).toBe(queueElement3.endLevel);
            expect(buildingZone.buildingId).toBe(building.id);
        });

        it("should process queue item when single queue items exists and building zone have building id set", async () => {
            const habitat = {
                getAuthId: () => 1
            } as HabitatModel;

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

            when(payloadDataService.getModel)
                .mockResolvedValue(habitat);
            when(buildingQueueRepository.findBy)
                .calledWith({
                    isConsumed: false,
                    endTime: expect.anything(),
                    buildingZone: {
                        habitatId: habitat.getAuthId()
                    }
                }).mockResolvedValue([
                    queueElement
                ]);

            await buildingQueueHandlerService.resolveQueue();

            expect(buildingQueueRepository.save).toBeCalledTimes(1);
            expect(buildingZoneRepository.save).toBeCalledTimes(1);

            expect(queueElement.isConsumed).toBe(true);
            expect(buildingZone.level).toBe(queueElement.endLevel);
            expect(buildingZone.buildingId).toBe(building.id);
        });
    });
});