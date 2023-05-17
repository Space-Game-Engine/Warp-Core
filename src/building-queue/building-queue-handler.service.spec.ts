import { Test, TestingModule } from "@nestjs/testing";
import { BuildingQueueHandlerService } from "@warp-core/building-queue/building-queue-handler.service";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { BuildingQueueRepository } from "@warp-core/database/repository/building-queue.repository";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { when } from "jest-when";
import { AuthorizedHabitatModel } from "@warp-core/auth/payload/model/habitat.model";

jest.mock("../database/repository/building-queue.repository");
jest.mock("../database/repository/building-zone.repository");
jest.mock("../auth/payload/model/habitat.model");

describe("Building queue handler service test", () => {
    let buildingQueueHandlerService: BuildingQueueHandlerService;
    let buildingQueueRepository: jest.Mocked<BuildingQueueRepository>;
    let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
    let authorizedHabitatModel: AuthorizedHabitatModel;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingQueueHandlerService,
                BuildingQueueRepository,
                BuildingZoneRepository,
                AuthorizedHabitatModel,
            ]
        }).compile();

        buildingQueueHandlerService = module.get<BuildingQueueHandlerService>(BuildingQueueHandlerService);
        buildingQueueRepository = module.get(BuildingQueueRepository);
        buildingZoneRepository = module.get(BuildingZoneRepository);
        authorizedHabitatModel = module.get(AuthorizedHabitatModel);
    });

    describe("resolveQueue", () => {
        it("should not process any queue items as building queue repository not fetch any data", async () => {
            const habitatId = 1;

            authorizedHabitatModel.id = habitatId;
            when(buildingQueueRepository.getUnresolvedQueueForHabitat)
                .calledWith(habitatId)
                .mockResolvedValue([]);
            
            await buildingQueueHandlerService.resolveQueue();

            expect(buildingQueueRepository.save).not.toBeCalled();
            expect(buildingZoneRepository.save).not.toBeCalled();
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
            when(buildingQueueRepository.getUnresolvedQueueForHabitat)
                .calledWith(habitatId)
                .mockResolvedValue([
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
            when(buildingQueueRepository.getUnresolvedQueueForHabitat)
                .calledWith(habitatId)
                .mockResolvedValue([
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
            when(buildingQueueRepository.getUnresolvedQueueForHabitat)
                .calledWith(habitatId)
                .mockResolvedValue([
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

            expect(buildingQueueRepository.save).not.toBeCalled();
            expect(buildingZoneRepository.save).not.toBeCalled();
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

            expect(buildingQueueRepository.save).toBeCalledTimes(1);
            expect(buildingZoneRepository.save).toBeCalledTimes(1);

            expect(queueElement.isConsumed).toBe(true);
            expect(buildingZone.level).toBe(queueElement.endLevel);
            expect(buildingZone.buildingId).toBe(building.id);
        });
    });
});