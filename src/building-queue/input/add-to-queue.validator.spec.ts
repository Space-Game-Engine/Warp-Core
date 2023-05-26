import { Test, TestingModule } from "@nestjs/testing";
import { AddToQueueInput } from "@warp-core/building-queue/input/add-to-queue.input";
import { AddToQueueValidator } from "@warp-core/building-queue/input/add-to-queue.validator";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { BuildingService } from "@warp-core/building";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { when } from "jest-when";

jest.mock('@warp-core/building/building.service');
jest.mock('@warp-core/building-zone/building-zone.service');

describe("Add to queue validator", () => {
    let buildingService: jest.Mocked<BuildingService>;
    let buildingZoneService: jest.Mocked<BuildingZoneService>;
    let addToQueueValidator: AddToQueueValidator;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingService,
                BuildingZoneService,
                AddToQueueValidator,
            ]
        }).compile();

        addToQueueValidator = module.get(AddToQueueValidator);
        buildingZoneService = module.get(BuildingZoneService);
        buildingService = module.get(BuildingService);
    });

    describe("validate", () => {
        it("should throw error when provided building zone does not exists", async () => {
            const addToQueue: AddToQueueInput = {
                localBuildingZoneId: 1000,
                buildingId: 1,
                endLevel: 10
            };

            when(buildingZoneService.getSingleBuildingZone)
                .calledWith(addToQueue.localBuildingZoneId)
                .mockResolvedValue(null);

            expect(addToQueueValidator
                .transform(addToQueue, { metatype: AddToQueueInput } as any))
                .rejects.toThrowError('Provided building zone does not exist.');
        });

        it("should throw error when building zone is not connected to any building and provided data does not have building id", async () => {
            const addToQueue: AddToQueueInput = {
                localBuildingZoneId: 1,
                buildingId: null,
                endLevel: 10
            };

            when(buildingZoneService.getSingleBuildingZone)
                .calledWith(addToQueue.localBuildingZoneId)
                .mockResolvedValue({
                    id: 1,
                    level: 0,
                    building: null
                } as BuildingZoneModel);

            expect(addToQueueValidator
                .transform(addToQueue, { metatype: AddToQueueInput } as any))
                .rejects.toThrowError('Building Id is required when current building zone does not have any building.');
        });

        it("should throw error when building zone is not connected to any building and provided data contains unknown building id", async () => {
            const addToQueue: AddToQueueInput = {
                localBuildingZoneId: 1,
                buildingId: 100,
                endLevel: 10
            };

            when(buildingZoneService.getSingleBuildingZone)
                .calledWith(addToQueue.localBuildingZoneId)
                .mockResolvedValue({
                    id: 1,
                    level: 0,
                    building: null
                } as BuildingZoneModel);

            when(buildingService.getBuildingById)
                .calledWith(addToQueue.buildingId)
                .mockResolvedValue(null);

            expect(addToQueueValidator
                .transform(addToQueue, { metatype: AddToQueueInput } as any))
                .rejects.toThrowError('Provided building does not exist.');
        });

        it("should throw error when building zone level is higher than add to queue input level", async () => {
            const addToQueue: AddToQueueInput = {
                localBuildingZoneId: 1,
                buildingId: 1,
                endLevel: 1
            };

            const buildingZone = {
                id: 1,
                level: 10,
                building: null
            } as BuildingZoneModel;

            const building = {
                id: 1
            } as BuildingModel;

            when(buildingZoneService.getSingleBuildingZone)
                .calledWith(addToQueue.localBuildingZoneId)
                .mockResolvedValue(buildingZone);

            when(buildingService.getBuildingById)
                .calledWith(addToQueue.buildingId)
                .mockResolvedValue(building);

            expect(addToQueueValidator
                .transform(addToQueue, { metatype: AddToQueueInput } as any))
                .rejects.toThrowError('End level should not be lower than existing level.');
        });

        it("should throw error when add to queue level is higher than possible to update", async () => {
            const addToQueue: AddToQueueInput = {
                localBuildingZoneId: 1,
                buildingId: 1,
                endLevel: 100
            };

            const buildingZone = {
                id: 1,
                level: 10,
                building: null
            } as BuildingZoneModel;

            const building = {
                id: 1,
                buildingDetailsAtCertainLevel: [
                    {
                        level: 10
                    }
                ]
            } as BuildingModel;

            when(buildingZoneService.getSingleBuildingZone)
                .calledWith(addToQueue.localBuildingZoneId)
                .mockResolvedValue(buildingZone);

            when(buildingService.getBuildingById)
                .calledWith(addToQueue.buildingId)
                .mockResolvedValue(building);

            expect(addToQueueValidator
                .transform(addToQueue, { metatype: AddToQueueInput } as any))
                .rejects.toThrowError('You cannot update higher than it is possible. Check Building details.');
        });
    });

    it("should validate add to queue input when it is a first level at building zone", async () => {
        const addToQueue: AddToQueueInput = {
            localBuildingZoneId: 1,
            buildingId: 1,
            endLevel: 1
        };

        const buildingZone = {
            id: 1,
            level: 0,
            building: null
        } as BuildingZoneModel;

        const building = {
            id: 1,
            buildingDetailsAtCertainLevel: [
                {
                    level: 10
                }
            ]
        } as BuildingModel;

        when(buildingZoneService.getSingleBuildingZone)
            .calledWith(addToQueue.localBuildingZoneId)
            .mockResolvedValue(buildingZone);

        when(buildingService.getBuildingById)
            .calledWith(addToQueue.buildingId)
            .mockResolvedValue(building);
        
        expect(addToQueueValidator
            .transform(addToQueue, { metatype: AddToQueueInput } as any))
            .resolves.toEqual(addToQueue);
    });

    it("should validate add to queue input when it is a second level at building zone", async () => {
        const addToQueue: AddToQueueInput = {
            localBuildingZoneId: 1,
            buildingId: 1,
            endLevel: 2
        };

        const building = {
            id: 1,
            buildingDetailsAtCertainLevel: [
                {
                    level: 10
                }
            ]
        } as BuildingModel;

        const buildingZone = {
            id: 1,
            level: 1,
            building: building
        } as BuildingZoneModel;

        when(buildingZoneService.getSingleBuildingZone)
            .calledWith(addToQueue.localBuildingZoneId)
            .mockResolvedValue(buildingZone);
        
        expect(addToQueueValidator
            .transform(addToQueue, { metatype: AddToQueueInput } as any))
            .resolves.toEqual(addToQueue);
        expect(buildingService.getBuildingById).toBeCalledTimes(0);
    });

    it("should validate add to queue input when it is a second level at building zone and building id is not in input", async () => {
        const addToQueue: AddToQueueInput = {
            localBuildingZoneId: 1,
            buildingId: null,
            endLevel: 2
        };

        const building = {
            id: 1,
            buildingDetailsAtCertainLevel: [
                {
                    level: 10
                }
            ]
        } as BuildingModel;

        const buildingZone = {
            id: 1,
            level: 1,
            building: building
        } as BuildingZoneModel;

        when(buildingZoneService.getSingleBuildingZone)
            .calledWith(addToQueue.localBuildingZoneId)
            .mockResolvedValue(buildingZone);
        
        expect(addToQueueValidator
            .transform(addToQueue, { metatype: AddToQueueInput } as any))
            .resolves.toEqual(addToQueue);
        expect(buildingService.getBuildingById).toBeCalledTimes(0);
    });
});